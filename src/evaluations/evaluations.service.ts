import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EvaluationConfigService } from '../evaluation-config/evaluation-config.service';
import { QuestionsService } from '../questions/questions.service';
import { Answer, AnswerDocument } from '../schemas/answer.schema';
import {
  Evaluation,
  EvaluationDocument,
  EvaluationLevel,
  EvaluationStatus,
} from '../schemas/evaluation.schema';
import { Question, QuestionDocument } from '../schemas/question.schema';
import { Section, SectionDocument } from '../schemas/section.schema';
import { UserDocument } from '../schemas/user.schema';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Injectable()
export class EvaluationsService {
  constructor(
    @InjectModel(Evaluation.name)
    private evaluationModel: Model<EvaluationDocument>,
    @InjectModel(Answer.name) private answerModel: Model<AnswerDocument>,
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    @InjectModel(Section.name) private sectionModel: Model<SectionDocument>,
    private evaluationConfigService: EvaluationConfigService,
    private questionsService: QuestionsService,
  ) {}

  async create(
    userId: string,
    createEvaluationDto: CreateEvaluationDto,
  ): Promise<EvaluationDocument> {
    // Verificar que la sección existe y está activa
    const section = await this.sectionModel
      .findById(createEvaluationDto.sectionId)
      .exec();
    if (!section) {
      throw new NotFoundException('Sección no encontrada');
    }
    if (!section.isActive) {
      throw new ForbiddenException(
        'Esta sección no está disponible para evaluaciones en este momento',
      );
    }

    // Verificar si ya existe una evaluación para este usuario y sección
    const existing = await this.evaluationModel.findOne({
      userId,
      sectionId: createEvaluationDto.sectionId,
    });

    if (existing) {
      if (existing.status === EvaluationStatus.COMPLETED) {
        throw new ConflictException(
          'Ya existe una evaluación completada para esta sección',
        );
      }
      // Si existe pero no está completada, retornar la existente
      return existing;
    }

    const evaluation = new this.evaluationModel({
      userId,
      sectionId: createEvaluationDto.sectionId,
      status: EvaluationStatus.PENDING,
    });

    return evaluation.save();
  }

  async startEvaluation(
    userId: string,
    evaluationId: string,
  ): Promise<EvaluationDocument> {
    const evaluation = await this.evaluationModel
      .findOne({
        _id: evaluationId,
        userId,
      })
      .exec();

    if (!evaluation) {
      throw new NotFoundException('Evaluación no encontrada');
    }

    if (evaluation.status === EvaluationStatus.COMPLETED) {
      throw new BadRequestException('La evaluación ya está completada');
    }

    evaluation.status = EvaluationStatus.IN_PROGRESS;
    evaluation.startedAt = new Date();
    return evaluation.save();
  }

  async submitAnswer(
    userId: string,
    evaluationId: string,
    submitAnswerDto: SubmitAnswerDto,
  ): Promise<AnswerDocument> {
    const evaluation = await this.evaluationModel
      .findOne({
        _id: evaluationId,
        userId,
      })
      .exec();

    if (!evaluation) {
      throw new NotFoundException('Evaluación no encontrada');
    }

    if (evaluation.status === EvaluationStatus.COMPLETED) {
      throw new BadRequestException('La evaluación ya está completada');
    }

    // Iniciar evaluación si está pendiente
    if (evaluation.status === EvaluationStatus.PENDING) {
      evaluation.status = EvaluationStatus.IN_PROGRESS;
      evaluation.startedAt = new Date();
      await evaluation.save();
    }

    // Obtener la pregunta
    const question = await this.questionModel
      .findById(submitAnswerDto.questionId)
      .exec();
    if (!question) {
      throw new NotFoundException('Pregunta no encontrada');
    }

    // Verificar que la pregunta pertenece a un cuestionario de la sección de la evaluación
    // (Esto requeriría una consulta adicional, por simplicidad asumimos que está correcto)

    // TODAS las preguntas son tipo Likert (scale) - el admin configura todo
    // Calcular score basado en la escala configurada por el admin
    let score = 0;

    const minScale = question.minScale ?? 1;
    const maxScale = question.maxScale ?? 10;

    const scaleValue =
      typeof submitAnswerDto.value === 'number'
        ? submitAnswerDto.value
        : parseFloat(submitAnswerDto.value);

    if (
      !isNaN(scaleValue) &&
      scaleValue >= minScale &&
      scaleValue <= maxScale
    ) {
      // Calcular puntos proporcionales: ((valor - min) / (max - min)) * puntos de la pregunta
      // Esto asegura que el valor mínimo da 0 puntos y el máximo da puntos completos
      const normalizedValue = (scaleValue - minScale) / (maxScale - minScale);
      score = normalizedValue * question.points;
    }

    // Crear o actualizar respuesta
    const answer = await this.answerModel
      .findOneAndUpdate(
        { evaluationId, questionId: submitAnswerDto.questionId },
        {
          evaluationId,
          questionId: submitAnswerDto.questionId,
          value: submitAnswerDto.value,
          score,
        },
        { upsert: true, new: true },
      )
      .exec();

    return answer;
  }

  async completeEvaluation(
    userId: string,
    evaluationId: string,
  ): Promise<EvaluationDocument> {
    const evaluation = await this.evaluationModel
      .findById(evaluationId)
      .populate('sectionId')
      .exec();

    if (!evaluation) {
      throw new NotFoundException('Evaluación no encontrada');
    }

    let evaluationUserId: string | undefined;
    if (evaluation.userId instanceof Types.ObjectId) {
      evaluationUserId = evaluation.userId.toString();
    } else if (evaluation.userId) {
      evaluationUserId = (evaluation.userId as UserDocument)._id.toString();
    }

    if (!evaluationUserId || evaluationUserId !== userId.toString()) {
      throw new ForbiddenException(
        'No tienes permiso para completar esta evaluación',
      );
    }

    if (evaluation.status === EvaluationStatus.COMPLETED) {
      return evaluation;
    }

    // Obtener todas las respuestas
    const answers = await this.answerModel
      .find({ evaluationId })
      .populate('questionId')
      .exec();

    if (answers.length === 0) {
      throw new BadRequestException(
        'No hay respuestas para completar la evaluación',
      );
    }

    // Calcular puntajes
    let totalScore = 0;
    let maxScore = 0;

    for (const answer of answers) {
      const question = answer.questionId as QuestionDocument;
      maxScore += question.points || 0;
      totalScore += answer.score || 0;
    }

    // Calcular nivel usando la configuración
    let sectionId: string;
    if (evaluation.sectionId instanceof Types.ObjectId) {
      sectionId = evaluation.sectionId.toString();
    } else {
      sectionId = (evaluation.sectionId as SectionDocument)._id.toString();
    }

    const level = (await this.evaluationConfigService.calculateLevel(
      sectionId,
      totalScore,
      maxScore,
    )) as EvaluationLevel;

    // Actualizar evaluación
    evaluation.status = EvaluationStatus.COMPLETED;
    evaluation.totalScore = totalScore;
    evaluation.maxScore = maxScore;
    evaluation.level = level;
    evaluation.completedAt = new Date();

    return evaluation.save();
  }

  async findByUser(userId: string): Promise<EvaluationDocument[]> {
    return this.evaluationModel
      .find({ userId })
      .populate('sectionId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUserAndSection(
    userId: string,
    sectionId: string,
  ): Promise<EvaluationDocument | null> {
    return this.evaluationModel
      .findOne({ userId, sectionId })
      .populate('sectionId')
      .exec();
  }

  async findOne(id: string, userId?: string): Promise<EvaluationDocument> {
    const query: any = { _id: id };
    if (userId) {
      query.userId = userId;
    }

    const evaluation = await this.evaluationModel
      .findOne(query)
      .populate('sectionId')
      .populate('userId')
      .exec();

    if (!evaluation) {
      throw new NotFoundException('Evaluación no encontrada');
    }

    return evaluation;
  }

  async getEvaluationWithAnswers(
    evaluationId: string,
    userId?: string,
  ): Promise<any> {
    const evaluation = await this.findOne(evaluationId, userId);
    const answers = await this.answerModel
      .find({ evaluationId })
      .populate('questionId')
      .sort({ 'questionId.order': 1 })
      .exec();

    return {
      ...evaluation.toObject(),
      answers,
    };
  }

  private compareAnswers(userAnswer: any, correctAnswer: any): boolean {
    if (typeof userAnswer === 'string' && typeof correctAnswer === 'string') {
      return (
        userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
      );
    }
    return userAnswer === correctAnswer;
  }
}
