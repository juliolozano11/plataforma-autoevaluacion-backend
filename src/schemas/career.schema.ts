import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CareerDocument = Career & Document;

@Schema({ timestamps: true })
export class Career {
  @Prop({ required: true, trim: true, unique: true })
  name: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const CareerSchema = SchemaFactory.createForClass(Career);

// Índices
CareerSchema.index({ name: 1 }, { unique: true });
CareerSchema.index({ isActive: 1 });

