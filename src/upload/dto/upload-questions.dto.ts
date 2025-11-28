import { IsMongoId, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadQuestionsDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID del cuestionario al que se cargarán las preguntas',
  })
  @IsMongoId({ message: 'El ID del cuestionario debe ser válido' })
  questionnaireId: string;

  @ApiProperty({
    example: 'excel',
    enum: ['excel', 'csv'],
    description: 'Formato del archivo a cargar (excel o csv)',
  })
  @IsEnum(['excel', 'csv'], { message: 'El formato debe ser excel o csv' })
  format: 'excel' | 'csv';
}

