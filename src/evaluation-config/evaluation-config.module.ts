import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EvaluationConfigService } from './evaluation-config.service';
import { EvaluationConfigController } from './evaluation-config.controller';
import { EvaluationConfig, EvaluationConfigSchema } from '../schemas/evaluation-config.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: EvaluationConfig.name, schema: EvaluationConfigSchema }]),
  ],
  controllers: [EvaluationConfigController],
  providers: [EvaluationConfigService],
  exports: [EvaluationConfigService],
})
export class EvaluationConfigModule {}

