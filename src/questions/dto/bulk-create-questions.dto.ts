import { IsMongoId, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateQuestionDto } from './create-question.dto';

export class BulkCreateQuestionsDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID del cuestionario al que pertenecen las preguntas',
  })
  @IsMongoId()
  questionnaireId: string;

  @ApiProperty({
    example: [
      {
        text: '¿Cómo te sientes trabajando en equipo?',
        type: 'multiple_choice',
        options: ['Muy bien', 'Bien', 'Regular', 'Mal'],
        points: 5,
        order: 1,
      },
      {
        text: 'Califica tu nivel de comunicación (1-10)',
        type: 'scale',
        points: 5,
        order: 2,
      },
    ],
    description: 'Array de preguntas a crear',
    type: [CreateQuestionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: Omit<CreateQuestionDto, 'questionnaireId'>[];
}

