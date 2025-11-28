import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Evaluation, EvaluationDocument } from '../schemas/evaluation.schema';
import { Answer, AnswerDocument } from '../schemas/answer.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Section, SectionDocument } from '../schemas/section.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Evaluation.name) private evaluationModel: Model<EvaluationDocument>,
    @InjectModel(Answer.name) private answerModel: Model<AnswerDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Section.name) private sectionModel: Model<SectionDocument>,
  ) {}

  // Reporte individual por estudiante
  async getIndividualReport(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const evaluations = await this.evaluationModel
      .find({ userId, status: 'completed' })
      .populate('sectionId')
      .sort({ createdAt: -1 })
      .exec();

    const report = {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        career: user.career,
        course: user.course,
        parallel: user.parallel,
      },
      evaluations: await Promise.all(
        evaluations.map(async (evaluation) => {
          const answers = await this.answerModel
            .find({ evaluationId: evaluation._id })
            .populate('questionId')
            .exec();

          return {
            id: evaluation._id,
            section: evaluation.sectionId,
            status: evaluation.status,
            totalScore: evaluation.totalScore,
            maxScore: evaluation.maxScore,
            percentage: evaluation.maxScore && evaluation.maxScore > 0 
              ? ((evaluation.totalScore || 0) / evaluation.maxScore * 100).toFixed(2)
              : 0,
            level: evaluation.level,
            completedAt: evaluation.completedAt,
            answers: answers.map((answer) => ({
              question: answer.questionId,
              value: answer.value,
              score: answer.score,
            })),
          };
        }),
      ),
      summary: {
        totalEvaluations: evaluations.length,
        completedEvaluations: evaluations.filter(e => e.status === 'completed').length,
        averageScore: evaluations.length > 0
          ? evaluations.reduce((sum, e) => sum + (e.totalScore || 0), 0) / evaluations.length
          : 0,
        levelsDistribution: this.calculateLevelsDistribution(evaluations),
      },
    };

    return report;
  }

  // Reporte grupal por carrera
  async getGroupReportByCareer(career: string, sectionId?: string) {
    const students = await this.userModel.find({ 
      role: 'student', 
      career,
      isActive: true 
    }).exec();

    const studentIds = students.map(s => s._id);

    const query: any = {
      userId: { $in: studentIds },
      status: 'completed',
    };

    if (sectionId) {
      query.sectionId = sectionId;
    }

    const evaluations = await this.evaluationModel
      .find(query)
      .populate('sectionId')
      .populate('userId')
      .exec();

    const report = {
      career,
      totalStudents: students.length,
      studentsWithEvaluations: new Set(evaluations.map(e => e.userId.toString())).size,
      evaluations: evaluations.length,
      bySection: await this.groupBySection(evaluations),
      levelsDistribution: this.calculateLevelsDistribution(evaluations),
      students: await Promise.all(
        students.map(async (student) => {
          const studentEvaluations = evaluations.filter(
            e => e.userId.toString() === student._id.toString()
          );
          return {
            id: student._id,
            email: student.email,
            firstName: student.firstName,
            lastName: student.lastName,
            course: student.course,
            parallel: student.parallel,
            evaluationsCount: studentEvaluations.length,
            averageScore: studentEvaluations.length > 0
              ? studentEvaluations.reduce((sum, e) => sum + (e.totalScore || 0), 0) / studentEvaluations.length
              : 0,
            levels: studentEvaluations.map(e => ({
              section: e.sectionId,
              level: e.level,
            })),
          };
        }),
      ),
    };

    return report;
  }

  // Reporte grupal por curso
  async getGroupReportByCourse(career: string, course: string, sectionId?: string) {
    const students = await this.userModel.find({ 
      role: 'student', 
      career,
      course,
      isActive: true 
    }).exec();

    const studentIds = students.map(s => s._id);

    const query: any = {
      userId: { $in: studentIds },
      status: 'completed',
    };

    if (sectionId) {
      query.sectionId = sectionId;
    }

    const evaluations = await this.evaluationModel
      .find(query)
      .populate('sectionId')
      .populate('userId')
      .exec();

    const report = {
      career,
      course,
      totalStudents: students.length,
      studentsWithEvaluations: new Set(evaluations.map(e => e.userId.toString())).size,
      evaluations: evaluations.length,
      bySection: await this.groupBySection(evaluations),
      levelsDistribution: this.calculateLevelsDistribution(evaluations),
      byParallel: await this.groupByParallel(students, evaluations),
    };

    return report;
  }

  // Panel de consulta de avance
  async getProgressPanel(sectionId?: string) {
    const sections = sectionId 
      ? [await this.sectionModel.findById(sectionId).exec()]
      : await this.sectionModel.find({ isActive: true }).exec();

    const totalStudents = await this.userModel.countDocuments({ 
      role: 'student', 
      isActive: true 
    });

    const panel = await Promise.all(
      sections.map(async (section) => {
        if (!section) return null;

        const evaluations = await this.evaluationModel
          .find({ 
            sectionId: section._id,
            status: 'completed' 
          })
          .exec();

        const inProgress = await this.evaluationModel
          .countDocuments({ 
            sectionId: section._id,
            status: 'in_progress' 
          });

        const pending = await this.evaluationModel
          .countDocuments({ 
            sectionId: section._id,
            status: 'pending' 
          });

        return {
          section: {
            id: section._id,
            name: section.name,
            displayName: section.displayName,
          },
          totalStudents,
          completed: evaluations.length,
          inProgress,
          pending,
          completionRate: totalStudents > 0 
            ? ((evaluations.length / totalStudents) * 100).toFixed(2)
            : 0,
          levelsDistribution: this.calculateLevelsDistribution(evaluations),
        };
      }),
    );

    return panel.filter(p => p !== null);
  }

  // Distribución de niveles por competencia
  async getLevelsDistributionByCompetence() {
    const sections = await this.sectionModel.find({ isActive: true }).exec();

    const distribution = await Promise.all(
      sections.map(async (section) => {
        const evaluations = await this.evaluationModel
          .find({ 
            sectionId: section._id,
            status: 'completed' 
          })
          .exec();

        return {
          section: {
            id: section._id,
            name: section.name,
            displayName: section.displayName,
          },
          total: evaluations.length,
          distribution: this.calculateLevelsDistribution(evaluations),
        };
      }),
    );

    return distribution;
  }

  // Métodos auxiliares
  private calculateLevelsDistribution(evaluations: EvaluationDocument[]): any {
    const distribution = {
      muy_bajo: 0,
      bajo: 0,
      intermedio: 0,
      alto: 0,
      muy_alto: 0,
    };

    evaluations.forEach(evaluation => {
      if (evaluation.level) {
        distribution[evaluation.level as keyof typeof distribution]++;
      }
    });

    return distribution;
  }

  private async groupBySection(evaluations: EvaluationDocument[]): Promise<any> {
    const grouped: any = {};

    for (const evaluation of evaluations) {
      const sectionId = evaluation.sectionId.toString();
      if (!grouped[sectionId]) {
        const section = await this.sectionModel.findById(sectionId).exec();
        grouped[sectionId] = {
          section: section,
          count: 0,
          averageScore: 0,
          totalScore: 0,
        };
      }
      grouped[sectionId].count++;
      grouped[sectionId].totalScore += evaluation.totalScore || 0;
    }

    // Calcular promedios
    Object.keys(grouped).forEach(key => {
      if (grouped[key].count > 0) {
        grouped[key].averageScore = (grouped[key].totalScore / grouped[key].count).toFixed(2);
      }
    });

    return grouped;
  }

  private async groupByParallel(students: UserDocument[], evaluations: EvaluationDocument[]): Promise<any> {
    const parallelGroups: any = {};

    students.forEach(student => {
      const parallel = student.parallel || 'Sin paralelo';
      if (!parallelGroups[parallel]) {
        parallelGroups[parallel] = {
          parallel,
          students: [],
          evaluationsCount: 0,
        };
      }

      const studentEvaluations = evaluations.filter(
        e => e.userId.toString() === student._id.toString()
      );

      parallelGroups[parallel].students.push({
        id: student._id,
        email: student.email,
        firstName: student.firstName,
        lastName: student.lastName,
        evaluationsCount: studentEvaluations.length,
      });

      parallelGroups[parallel].evaluationsCount += studentEvaluations.length;
    });

    return parallelGroups;
  }
}

