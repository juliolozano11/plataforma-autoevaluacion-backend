import { IsMongoId, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEvaluationDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID de la sección para la cual se crea la evaluación',
  })
  @IsMongoId({ message: 'El ID de la sección debe ser válido' })
  sectionId: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439012',
    description: 'ID del cuestionario para el cual se crea la evaluación',
    required: false,
  })
  @IsMongoId({ message: 'El ID del cuestionario debe ser válido' })
  @IsOptional()
  questionnaireId?: string;
}

