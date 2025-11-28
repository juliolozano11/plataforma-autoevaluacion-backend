import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'admin',
  STUDENT = 'student',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ type: String, required: true, enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Prop({ trim: true })
  career?: string; // Solo para estudiantes

  @Prop({ trim: true })
  course?: string; // Solo para estudiantes (ej: "8vo")

  @Prop({ trim: true })
  parallel?: string; // Solo para estudiantes (ej: "A")

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Índices
// Nota: email ya tiene unique: true en @Prop, no duplicar aquí
UserSchema.index({ role: 1 });
UserSchema.index({ career: 1, course: 1, parallel: 1 });

// Validación de correo institucional
UserSchema.pre('save', function (next) {
  if (!this.email.endsWith('@ug.edu.ec')) {
    return next(new Error('El correo debe ser del dominio @ug.edu.ec'));
  }
  next();
});

