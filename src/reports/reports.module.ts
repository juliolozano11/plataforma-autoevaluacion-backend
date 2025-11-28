import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Evaluation, EvaluationSchema } from '../schemas/evaluation.schema';
import { Answer, AnswerSchema } from '../schemas/answer.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Section, SectionSchema } from '../schemas/section.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Evaluation.name, schema: EvaluationSchema },
      { name: Answer.name, schema: AnswerSchema },
      { name: User.name, schema: UserSchema },
      { name: Section.name, schema: SectionSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}

