import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Evaluation } from './evaluation.schema';
import { Question } from './question.schema';

export type AnswerDocument = Answer & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Answer {
  @Prop({ type: Types.ObjectId, ref: 'Evaluation', required: true })
  evaluationId: Types.ObjectId | Evaluation;

  @Prop({ type: Types.ObjectId, ref: 'Question', required: true })
  questionId: Types.ObjectId | Question;

  @Prop({ type: Object, required: true })
  value: any; // Respuesta del estudiante

  @Prop({ type: Number, min: 0 })
  score?: number; // Puntaje obtenido en esta pregunta
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);

// Índices
AnswerSchema.index({ evaluationId: 1, questionId: 1 }, { unique: true });
AnswerSchema.index({ evaluationId: 1 });
AnswerSchema.index({ questionId: 1 });

