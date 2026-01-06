import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SectionsService } from './sections.service';
import { SectionsController } from './sections.controller';
import { Section, SectionSchema } from '../schemas/section.schema';
import { Questionnaire, QuestionnaireSchema } from '../schemas/questionnaire.schema';
import { Question, QuestionSchema } from '../schemas/question.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Section.name, schema: SectionSchema },
      { name: Questionnaire.name, schema: QuestionnaireSchema },
      { name: Question.name, schema: QuestionSchema },
    ]),
  ],
  controllers: [SectionsController],
  providers: [SectionsService],
  exports: [SectionsService],
})
export class SectionsModule {}

