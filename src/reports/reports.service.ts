import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Answer, AnswerDocument } from '../schemas/answer.schema';
import { Evaluation, EvaluationDocument } from '../schemas/evaluation.schema';
import { Section, SectionDocument } from '../schemas/section.schema';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Evaluation.name)
    private evaluationModel: Model<EvaluationDocument>,
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
            percentage:
              evaluation.maxScore && evaluation.maxScore > 0
                ? (
                    ((evaluation.totalScore || 0) / evaluation.maxScore) *
                    100
                  ).toFixed(2)
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
        completedEvaluations: evaluations.filter(
          (e) => e.status === 'completed',
        ).length,
        averageScore:
          evaluations.length > 0
            ? evaluations.reduce((sum, e) => sum + (e.totalScore || 0), 0) /
              evaluations.length
            : 0,
        levelsDistribution: this.calculateLevelsDistribution(evaluations),
      },
    };

    return report;
  }

  // Reporte grupal por carrera
  async getGroupReportByCareer(career: string, sectionId?: string) {
    const students = await this.userModel
      .find({
        role: 'student',
        career,
        isActive: true,
      })
      .exec();

    const studentIds = students.map((s) => s._id);

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
      studentsWithEvaluations: new Set(
        evaluations.map((e) => e.userId.toString()),
      ).size,
      evaluations: evaluations.length,
      bySection: await this.groupBySection(evaluations),
      levelsDistribution: this.calculateLevelsDistribution(evaluations),
      students: await Promise.all(
        students.map(async (student) => {
          const studentEvaluations = evaluations.filter(
            (e) => e.userId.toString() === student._id.toString(),
          );
          return {
            id: student._id,
            email: student.email,
            firstName: student.firstName,
            lastName: student.lastName,
            course: student.course,
            parallel: student.parallel,
            evaluationsCount: studentEvaluations.length,
            averageScore:
              studentEvaluations.length > 0
                ? studentEvaluations.reduce(
                    (sum, e) => sum + (e.totalScore || 0),
                    0,
                  ) / studentEvaluations.length
                : 0,
            levels: studentEvaluations.map((e) => ({
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
  async getGroupReportByCourse(
    career: string,
    course: string,
    sectionId?: string,
  ) {
    const students = await this.userModel
      .find({
        role: 'student',
        career,
        course,
        isActive: true,
      })
      .exec();

    const studentIds = students.map((s) => s._id);

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
      studentsWithEvaluations: new Set(
        evaluations.map((e) => e.userId.toString()),
      ).size,
      evaluations: evaluations.length,
      bySection: await this.groupBySection(evaluations),
      levelsDistribution: this.calculateLevelsDistribution(evaluations),
      byParallel: await this.groupByParallel(students, evaluations),
    };

    return report;
  }

  // Panel de consulta de avance
  async getProgressPanel(sectionId?: string) {
    // Convertir sectionId a ObjectId si viene como string
    let sectionObjectId: Types.ObjectId | undefined;
    if (sectionId) {
      if (!Types.ObjectId.isValid(sectionId)) {
        throw new NotFoundException('ID de sección inválido');
      }
      sectionObjectId = new Types.ObjectId(sectionId);
    }

    // Obtener las secciones a considerar en el panel de progreso
    // - Si viene sectionId: solo esa sección
    // - Si no viene sectionId: **todas** las secciones (activas e inactivas)
    //   para que el administrador vea el historial completo, no solo lo activo
    const sections = sectionId
      ? [await this.sectionModel.findById(sectionObjectId).exec()]
      : await this.sectionModel.find({}).exec();

    const totalStudents = await this.userModel.countDocuments({
      role: 'student',
      isActive: true,
    });

    // Obtener TODAS las evaluaciones de una vez para debug y comparación
    const allEvaluationsInDB = await this.evaluationModel
      .find({})
      .select('status sectionId userId _id')
      .lean()
      .exec();

    // Obtener TODAS las secciones (activas e inactivas) para comparar
    const allSections = await this.sectionModel.find({}).exec();

    // Log general de todas las evaluaciones y secciones
    if (process.env.NODE_ENV !== 'production') {
      console.log('[DEBUG] Secciones encontradas:', {
        totalSections: allSections.length,
        activeSections: sections.length,
        sections: allSections.map((s: any) => ({
          id: s._id?.toString(),
          name: s.name,
          displayName: s.displayName,
          isActive: s.isActive,
        })),
      });

      console.log('[DEBUG] Todas las evaluaciones en la BD:', {
        total: allEvaluationsInDB.length,
        byStatus: {
          completed: allEvaluationsInDB.filter(
            (e: any) => e.status === 'completed',
          ).length,
          inProgress: allEvaluationsInDB.filter(
            (e: any) => e.status === 'in_progress',
          ).length,
          pending: allEvaluationsInDB.filter((e: any) => e.status === 'pending')
            .length,
        },
        evaluations: allEvaluationsInDB.map((e: any) => ({
          id: e._id?.toString(),
          status: e.status,
          sectionId: e.sectionId?.toString() || String(e.sectionId),
          userId: e.userId?.toString() || String(e.userId),
        })),
      });
    }

    const panel = await Promise.all(
      sections.map(async (section) => {
        if (!section) return null;

        // Usar el ID de la sección - Mongoose manejará la conversión automáticamente
        // Asegurarse de que el ID esté en el formato correcto
        const sectionId = section._id;
        const sectionIdForQuery =
          sectionId instanceof Types.ObjectId
            ? sectionId
            : new Types.ObjectId(String(sectionId));

        // También preparar como string para consultas alternativas
        const sectionIdString = String(sectionId);

        // Filtrar evaluaciones que pertenecen a esta sección usando todas las evaluaciones ya cargadas
        // Comparar tanto ObjectId como string para asegurar que encontremos todas
        const sectionEvaluations = allEvaluationsInDB.filter((e: any) => {
          const evalSectionId = e.sectionId?.toString() || String(e.sectionId);
          const sectionIdStr = sectionIdString;
          // También comparar con ObjectId si está disponible
          const matchesString = evalSectionId === sectionIdStr;
          const matchesObjectId =
            e.sectionId &&
            sectionIdForQuery &&
            String(e.sectionId) === String(sectionIdForQuery);
          return matchesString || matchesObjectId;
        });

        // Contar por status - usar comparación más robusta
        const completedEvaluations = sectionEvaluations.filter(
          (e: any) =>
            String(e.status).toLowerCase() === 'completed' ||
            e.status === 'completed',
        );
        const inProgress = sectionEvaluations.filter(
          (e: any) =>
            String(e.status).toLowerCase() === 'in_progress' ||
            e.status === 'in_progress',
        ).length;
        const pending = sectionEvaluations.filter(
          (e: any) =>
            String(e.status).toLowerCase() === 'pending' ||
            e.status === 'pending',
        ).length;

        // Obtener las evaluaciones completadas con todos los datos para calcular niveles
        const evaluationIds = completedEvaluations.map((e: any) => e._id);

        // Si no hay IDs, no hacer consulta
        let evaluations: any[] = [];
        if (evaluationIds.length > 0) {
          const foundEvaluations = await this.evaluationModel
            .find({
              _id: { $in: evaluationIds },
            })
            .exec();

          // Filtrar solo las que realmente están completadas (por si acaso)
          evaluations = foundEvaluations.filter(
            (e: any) =>
              String(e.status).toLowerCase() === 'completed' ||
              e.status === 'completed',
          );
        }

        // Usar el conteo del filtro inicial, no de la consulta adicional
        const completedCount = completedEvaluations.length;

        // Log para debug (solo en desarrollo)
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[DEBUG] Sección ${section.name} (${sectionIdString}):`, {
            totalEvaluationsInDB: allEvaluationsInDB.length,
            totalEvaluationsInSection: sectionEvaluations.length,
            completedFromFilter: completedCount,
            completedFromQuery: evaluations.length,
            evaluationIds: evaluationIds.map((id: any) => id?.toString()),
            inProgress,
            pending,
            sectionEvaluations: sectionEvaluations.map((e: any) => ({
              id: e._id?.toString(),
              status: e.status,
              statusType: typeof e.status,
              sectionId: e.sectionId?.toString() || String(e.sectionId),
              userId: e.userId?.toString() || String(e.userId),
            })),
          });
        }

        return {
          section: {
            id: section._id.toString(),
            name: section.name,
            displayName: section.displayName,
          },
          totalStudents,
          completed: completedCount, // Usar el conteo del filtro inicial
          inProgress,
          pending,
          completionRate:
            totalStudents > 0
              ? ((completedCount / totalStudents) * 100).toFixed(2)
              : '0.00',
          levelsDistribution: this.calculateLevelsDistribution(evaluations),
        };
      }),
    );

    const filteredPanel = panel.filter((p) => p !== null);

    // Calcular totales agregados de todas las secciones
    const totals = filteredPanel.reduce(
      (acc, item) => {
        if (item) {
          acc.totalEvaluations +=
            item.completed + item.inProgress + item.pending;
          acc.completedEvaluations += item.completed;
          acc.inProgressEvaluations += item.inProgress;
        }
        return acc;
      },
      {
        totalEvaluations: 0,
        completedEvaluations: 0,
        inProgressEvaluations: 0,
      },
    );

    // Devolver objeto con totales agregados que espera el frontend
    const response: any = {
      totalEvaluations: totals.totalEvaluations,
      completedEvaluations: totals.completedEvaluations,
      inProgressEvaluations: totals.inProgressEvaluations,
      sections: filteredPanel, // Mantener el array de secciones por si se necesita en el futuro
    };

    // Agregar información de debug en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      response.debug = {
        totalSections: filteredPanel.length,
        totalStudents,
        sectionsInfo: filteredPanel.map((item) => ({
          sectionId: item?.section.id,
          sectionName: item?.section.name,
          completed: item?.completed,
          inProgress: item?.inProgress,
          pending: item?.pending,
        })),
      };
    }

    return response;
  }

  // Distribución de niveles por competencia
  async getLevelsDistributionByCompetence() {
    const sections = await this.sectionModel.find({ isActive: true }).exec();

    const distribution = await Promise.all(
      sections.map(async (section) => {
        const evaluations = await this.evaluationModel
          .find({
            sectionId: section._id,
            status: 'completed',
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

  // Método de debug para ver todas las evaluaciones
  async debugEvaluations(sectionId?: string) {
    const allEvaluations = await this.evaluationModel
      .find(sectionId ? { sectionId } : {})
      .populate('sectionId', 'name displayName')
      .populate('userId', 'email firstName lastName role')
      .lean()
      .exec();

    const sections = await this.sectionModel.find({ isActive: true }).exec();

    const bySection = sections.map((section) => {
      const sectionEvaluations = allEvaluations.filter((e: any) => {
        const evalSectionId =
          e.sectionId?._id?.toString() ||
          e.sectionId?.toString() ||
          e.sectionId;
        const sectionIdStr = section._id.toString();
        return evalSectionId === sectionIdStr;
      });

      return {
        section: {
          id: section._id.toString(),
          name: section.name,
          displayName: section.displayName,
        },
        totalEvaluations: sectionEvaluations.length,
        evaluations: sectionEvaluations.map((e: any) => ({
          id: e._id.toString(),
          status: e.status,
          sectionId:
            e.sectionId?._id?.toString() ||
            e.sectionId?.toString() ||
            e.sectionId,
          userId: e.userId?._id?.toString() || e.userId?.toString() || e.userId,
          userEmail: e.userId?.email || 'N/A',
          totalScore: e.totalScore,
          maxScore: e.maxScore,
          level: e.level,
          completedAt: e.completedAt,
        })),
        byStatus: {
          completed: sectionEvaluations.filter(
            (e: any) => e.status === 'completed',
          ).length,
          inProgress: sectionEvaluations.filter(
            (e: any) => e.status === 'in_progress',
          ).length,
          pending: sectionEvaluations.filter((e: any) => e.status === 'pending')
            .length,
        },
      };
    });

    return {
      totalEvaluations: allEvaluations.length,
      bySection,
      allEvaluations: allEvaluations.map((e: any) => ({
        id: e._id.toString(),
        status: e.status,
        sectionId:
          e.sectionId?._id?.toString() ||
          e.sectionId?.toString() ||
          e.sectionId,
        sectionName: e.sectionId?.name || 'N/A',
        userId: e.userId?._id?.toString() || e.userId?.toString() || e.userId,
        userEmail: e.userId?.email || 'N/A',
        totalScore: e.totalScore,
        maxScore: e.maxScore,
        level: e.level,
      })),
    };
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

    evaluations.forEach((evaluation) => {
      if (evaluation.level) {
        distribution[evaluation.level as keyof typeof distribution]++;
      }
    });

    return distribution;
  }

  private async groupBySection(
    evaluations: EvaluationDocument[],
  ): Promise<any> {
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
    Object.keys(grouped).forEach((key) => {
      if (grouped[key].count > 0) {
        grouped[key].averageScore = (
          grouped[key].totalScore / grouped[key].count
        ).toFixed(2);
      }
    });

    return grouped;
  }

  private async groupByParallel(
    students: UserDocument[],
    evaluations: EvaluationDocument[],
  ): Promise<any> {
    const parallelGroups: any = {};

    students.forEach((student) => {
      const parallel = student.parallel || 'Sin paralelo';
      if (!parallelGroups[parallel]) {
        parallelGroups[parallel] = {
          parallel,
          students: [],
          evaluationsCount: 0,
        };
      }

      const studentEvaluations = evaluations.filter(
        (e) => e.userId.toString() === student._id.toString(),
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
