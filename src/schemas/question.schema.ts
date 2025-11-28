import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Questionnaire } from './questionnaire.schema';

export type QuestionDocument = Question & Document;

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  SCALE = 'scale',
  TEXT = 'text',
}

@Schema({ timestamps: true })
export class Question {
  @Prop({ type: Types.ObjectId, ref: 'Questionnaire', required: true })
  questionnaireId: Types.ObjectId | Questionnaire;

  @Prop({ required: true, trim: true })
  text: string;

  @Prop({ type: String, required: true, enum: QuestionType })
  type: QuestionType;

  @Prop({ type: [String] })
  options?: string[]; // Para multiple_choice

  // correctAnswer puede ser de cualquier tipo (string, number, boolean, etc.)
  @Prop({ type: Object, required: false })
  correctAnswer?: any; // Respuesta correcta (opcional)

  // Configuración para preguntas de escala (Likert)
  @Prop({ type: Number, default: 1 })
  minScale?: number; // Valor mínimo de la escala (por defecto 1)

  @Prop({ type: Number, default: 10 })
  maxScale?: number; // Valor máximo de la escala (por defecto 10)

  @Prop({ type: Number, required: true, min: 0, default: 1 })
  points: number;

  @Prop({ type: Number, required: true, min: 0 })
  order: number;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

// Índices
QuestionSchema.index({ questionnaireId: 1, order: 1 });
QuestionSchema.index({ questionnaireId: 1, isActive: 1 });

