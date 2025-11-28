import { IsMongoId, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitAnswerDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID de la pregunta a la que se responde',
  })
  @IsMongoId()
  questionId: string;

  @ApiProperty({
    example: 'Bien',
    description: 'Valor de la respuesta (puede ser string, number, boolean, etc.)',
  })
  @IsNotEmpty()
  value: any;
}

