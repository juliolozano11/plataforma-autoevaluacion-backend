import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SectionDocument = Section & Document;

export enum SectionName {
  BLANDAS = 'blandas',
  ADAPTATIVAS = 'adaptativas',
  TECNOLOGICAS = 'tecnologicas',
}

@Schema({ timestamps: true })
export class Section {
  @Prop({ type: String, required: true, unique: true, enum: SectionName })
  name: SectionName;

  @Prop({ required: true, trim: true })
  displayName: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const SectionSchema = SchemaFactory.createForClass(Section);

// Índices
// Nota: name ya tiene unique: true en @Prop, no duplicar aquí
SectionSchema.index({ isActive: 1 });

