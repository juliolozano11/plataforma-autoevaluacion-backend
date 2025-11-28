import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { QuestionsModule } from '../questions/questions.module';
import { QuestionnairesModule } from '../questionnaires/questionnaires.module';

@Module({
  imports: [QuestionsModule, QuestionnairesModule],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}

