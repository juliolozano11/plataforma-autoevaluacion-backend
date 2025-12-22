import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';
import { Section } from './section.schema';
import { Questionnaire } from './questionnaire.schema';

export type EvaluationDocument = Evaluation & Document;

export enum EvaluationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export enum EvaluationLevel {
  MUY_BAJO = 'muy_bajo',
  BAJO = 'bajo',
  INTERMEDIO = 'intermedio',
  ALTO = 'alto',
  MUY_ALTO = 'muy_alto',
}

@Schema({ timestamps: true })
export class Evaluation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId | User;

  @Prop({ type: Types.ObjectId, ref: 'Section', required: true })
  sectionId: Types.ObjectId | Section;

  @Prop({ type: Types.ObjectId, ref: 'Questionnaire', required: false })
  questionnaireId?: Types.ObjectId | Questionnaire;

  @Prop({ type: String, required: true, enum: EvaluationStatus, default: EvaluationStatus.PENDING })
  status: EvaluationStatus;

  @Prop({ type: Number, min: 0 })
  totalScore?: number;

  @Prop({ type: Number, min: 0 })
  maxScore?: number;

  @Prop({ type: String, enum: EvaluationLevel })
  level?: EvaluationLevel;

  @Prop({ type: Date })
  startedAt?: Date;

  @Prop({ type: Date })
  completedAt?: Date;
}

export const EvaluationSchema = SchemaFactory.createForClass(Evaluation);

// Índices
// Índice único: un usuario solo puede tener una evaluación por sección y cuestionario
// sparse: true permite que el índice se aplique solo cuando questionnaireId existe (para compatibilidad con evaluaciones antiguas)
EvaluationSchema.index({ userId: 1, sectionId: 1, questionnaireId: 1 }, { unique: true, sparse: true });
EvaluationSchema.index({ userId: 1, status: 1 });
EvaluationSchema.index({ sectionId: 1, status: 1 });
EvaluationSchema.index({ status: 1, completedAt: 1 });

