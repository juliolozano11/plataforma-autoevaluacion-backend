import { IsString, IsMongoId, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionnaireDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID de la sección a la que pertenece el cuestionario',
  })
  @IsMongoId({ message: 'El ID de la sección debe ser válido' })
  sectionId: string;

  @ApiProperty({
    example: 'Cuestionario de Comunicación Efectiva',
    description: 'Título del cuestionario',
    minLength: 3,
  })
  @IsString()
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
  title: string;

  @ApiProperty({
    example: 'Este cuestionario evalúa las habilidades de comunicación del estudiante',
    description: 'Descripción del cuestionario',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

