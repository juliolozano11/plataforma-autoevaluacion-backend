import { PartialType } from '@nestjs/mapped-types';
import { CreateEvaluationConfigDto } from './create-evaluation-config.dto';

export class UpdateEvaluationConfigDto extends PartialType(CreateEvaluationConfigDto) {}

