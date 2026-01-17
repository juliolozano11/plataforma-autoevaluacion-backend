import { IsString, IsMongoId, IsEnum, IsArray, IsNumber, Min, Max, IsOptional, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QuestionType } from '../../schemas/question.schema';

export class CreateQuestionDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID del cuestionario al que pertenece la pregunta',
  })
  @IsMongoId({ message: 'El ID del cuestionario debe ser válido' })
  questionnaireId: string;

  @ApiProperty({
    example: '¿Cómo te sientes trabajando en equipo?',
    description: 'Texto de la pregunta',
  })
  @IsString()
  text: string;

  @ApiProperty({
    example: QuestionType.MULTIPLE_CHOICE,
    enum: QuestionType,
    description: 'Tipo de pregunta (multiple_choice, scale, text)',
  })
  @IsEnum(QuestionType, { message: 'El tipo debe ser: multiple_choice, scale o text' })
  type: QuestionType;

  @ApiProperty({
    example: ['Muy bien', 'Bien', 'Regular', 'Mal'],
    description: 'Opciones para preguntas de opción múltiple',
    required: false,
    type: [String],
  })
  @ValidateIf((o) => o.type === QuestionType.MULTIPLE_CHOICE)
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiProperty({
    example: 'Bien',
    description: 'Respuesta correcta (opcional)',
    required: false,
  })
  @IsOptional()
  correctAnswer?: any;

  @ApiProperty({
    example: 1,
    description: 'Valor mínimo de la escala para preguntas tipo scale (Likert). Siempre debe ser 1',
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1, { message: 'El valor mínimo siempre debe ser 1' })
  minScale?: number;

  @ApiProperty({
    example: 5,
    description: 'Valor máximo de la escala para preguntas tipo scale (Likert). Debe estar entre 5 y 10',
    required: false,
    default: 5,
    minimum: 5,
    maximum: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(5, { message: 'El valor máximo debe ser al menos 5' })
  @Max(10, { message: 'El valor máximo no puede ser mayor a 10' })
  maxScale?: number;

  @ApiProperty({
    example: 'satisfaction',
    description: 'Tipo de respuesta para escalas: satisfaction, frequency, agreement, numeric',
    required: false,
    default: 'satisfaction',
    enum: ['satisfaction', 'frequency', 'agreement', 'numeric'],
  })
  @IsOptional()
  @IsEnum(['satisfaction', 'frequency', 'agreement', 'numeric'], {
    message: 'El tipo de respuesta debe ser: satisfaction, frequency, agreement o numeric',
  })
  responseType?: 'satisfaction' | 'frequency' | 'agreement' | 'numeric';

  @ApiProperty({
    example: 5,
    description: 'Puntos que vale la pregunta',
    minimum: 0,
    default: 1,
  })
  @IsNumber()
  @Min(0)
  points: number;

  @ApiProperty({
    example: 1,
    description: 'Orden de la pregunta en el cuestionario',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  order: number;
}

