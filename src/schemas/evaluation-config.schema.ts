import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Section } from './section.schema';

export type EvaluationConfigDocument = EvaluationConfig & Document;

@Schema({ timestamps: true })
export class EvaluationConfig {
  @Prop({ type: Types.ObjectId, ref: 'Section', required: true, unique: true })
  sectionId: Types.ObjectId | Section;

  @Prop({
    type: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    required: true,
  })
  muyBajo: { min: number; max: number };

  @Prop({
    type: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    required: true,
  })
  bajo: { min: number; max: number };

  @Prop({
    type: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    required: true,
  })
  intermedio: { min: number; max: number };

  @Prop({
    type: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    required: true,
  })
  alto: { min: number; max: number };

  @Prop({
    type: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    required: true,
  })
  muyAlto: { min: number; max: number };

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const EvaluationConfigSchema = SchemaFactory.createForClass(EvaluationConfig);

// Índices
// Nota: sectionId ya tiene unique: true en @Prop, no duplicar aquí
EvaluationConfigSchema.index({ sectionId: 1, isActive: 1 });

