import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EvaluationsService } from './evaluations.service';
import { EvaluationsController } from './evaluations.controller';
import { Evaluation, EvaluationSchema } from '../schemas/evaluation.schema';
import { Answer, AnswerSchema } from '../schemas/answer.schema';
import { Question, QuestionSchema } from '../schemas/question.schema';
import { Section, SectionSchema } from '../schemas/section.schema';
import { EvaluationConfigModule } from '../evaluation-config/evaluation-config.module';
import { QuestionsModule } from '../questions/questions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Evaluation.name, schema: EvaluationSchema },
      { name: Answer.name, schema: AnswerSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: Section.name, schema: SectionSchema },
    ]),
    EvaluationConfigModule,
    QuestionsModule,
  ],
  controllers: [EvaluationsController],
  providers: [EvaluationsService],
  exports: [EvaluationsService],
})
export class EvaluationsModule {}

