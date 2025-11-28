import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionnairesService } from './questionnaires.service';
import { QuestionnairesController } from './questionnaires.controller';
import { Questionnaire, QuestionnaireSchema } from '../schemas/questionnaire.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Questionnaire.name, schema: QuestionnaireSchema }]),
  ],
  controllers: [QuestionnairesController],
  providers: [QuestionnairesService],
  exports: [QuestionnairesService],
})
export class QuestionnairesModule {}

