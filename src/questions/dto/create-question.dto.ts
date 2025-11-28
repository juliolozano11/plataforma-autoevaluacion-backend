import { IsString, IsMongoId, IsEnum, IsArray, IsNumber, Min, IsOptional, ValidateIf } from 'class-validator';
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

