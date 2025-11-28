import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Section } from './section.schema';

export type QuestionnaireDocument = Questionnaire & Document;

@Schema({ timestamps: true })
export class Questionnaire {
  @Prop({ type: Types.ObjectId, ref: 'Section', required: true })
  sectionId: Types.ObjectId | Section;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const QuestionnaireSchema = SchemaFactory.createForClass(Questionnaire);

// Índices
QuestionnaireSchema.index({ sectionId: 1, isActive: 1 });
QuestionnaireSchema.index({ createdAt: -1 });

