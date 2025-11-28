import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EvaluationConfig, EvaluationConfigDocument } from '../schemas/evaluation-config.schema';
import { CreateEvaluationConfigDto } from './dto/create-evaluation-config.dto';
import { UpdateEvaluationConfigDto } from './dto/update-evaluation-config.dto';

@Injectable()
export class EvaluationConfigService {
  constructor(
    @InjectModel(EvaluationConfig.name) private configModel: Model<EvaluationConfigDocument>,
  ) {}

  async create(createConfigDto: CreateEvaluationConfigDto): Promise<EvaluationConfigDocument> {
    // Verificar si ya existe configuración para esta sección
    const existing = await this.configModel.findOne({ sectionId: createConfigDto.sectionId });
    if (existing) {
      throw new ConflictException('Ya existe una configuración para esta sección');
    }

    // Validar rangos
    this.validateRanges(createConfigDto);

    const config = new this.configModel(createConfigDto);
    return config.save();
  }

  async findAll(): Promise<EvaluationConfigDocument[]> {
    return this.configModel.find().populate('sectionId').exec();
  }

  async findBySection(sectionId: string): Promise<EvaluationConfigDocument | null> {
    return this.configModel.findOne({ sectionId, isActive: true }).populate('sectionId').exec();
  }

  async findOne(id: string): Promise<EvaluationConfigDocument> {
    const config = await this.configModel.findById(id).populate('sectionId').exec();
    if (!config) {
      throw new NotFoundException('Configuración no encontrada');
    }
    return config;
  }

  async update(id: string, updateConfigDto: UpdateEvaluationConfigDto): Promise<EvaluationConfigDocument> {
    const config = await this.configModel.findById(id).exec();
    if (!config) {
      throw new NotFoundException('Configuración no encontrada');
    }

    // Validar rangos si se actualizan
    const merged = { ...config.toObject(), ...updateConfigDto };
    if (merged.muyBajo || merged.bajo || merged.intermedio || 
        merged.alto || merged.muyAlto) {
      this.validateRanges(merged);
    }

    const updated = await this.configModel
      .findByIdAndUpdate(id, updateConfigDto, { new: true })
      .populate('sectionId')
      .exec();

    if (!updated) {
      throw new NotFoundException('Configuración no encontrada');
    }

    return updated;
  }

  async calculateLevel(sectionId: string, score: number, maxScore: number): Promise<string> {
    const config = await this.findBySection(sectionId);
    if (!config) {
      throw new NotFoundException('No hay configuración para esta sección');
    }

    // Calcular porcentaje
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

    // Determinar nivel según rangos
    if (percentage >= config.muyBajo.min && percentage <= config.muyBajo.max) {
      return 'muy_bajo';
    } else if (percentage >= config.bajo.min && percentage <= config.bajo.max) {
      return 'bajo';
    } else if (percentage >= config.intermedio.min && percentage <= config.intermedio.max) {
      return 'intermedio';
    } else if (percentage >= config.alto.min && percentage <= config.alto.max) {
      return 'alto';
    } else if (percentage >= config.muyAlto.min && percentage <= config.muyAlto.max) {
      return 'muy_alto';
    }

    // Por defecto, retornar el nivel más bajo
    return 'muy_bajo';
  }

  async toggleActive(id: string): Promise<EvaluationConfigDocument> {
    const config = await this.findOne(id);
    config.isActive = !config.isActive;
    return config.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.configModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Configuración no encontrada');
    }
  }

  private validateRanges(config: CreateEvaluationConfigDto | any): void {
    const ranges = [
      { name: 'muyBajo', range: config.muyBajo },
      { name: 'bajo', range: config.bajo },
      { name: 'intermedio', range: config.intermedio },
      { name: 'alto', range: config.alto },
      { name: 'muyAlto', range: config.muyAlto },
    ];

    // Validar que min <= max
    for (const { name, range } of ranges) {
      if (range.min > range.max) {
        throw new BadRequestException(`El rango ${name} tiene min mayor que max`);
      }
      if (range.min < 0 || range.max > 100) {
        throw new BadRequestException(`El rango ${name} debe estar entre 0 y 100`);
      }
    }

    // Validar que los rangos no se solapen (opcional, dependiendo de los requisitos)
    // Por ahora solo validamos que estén en orden
    const sortedRanges = ranges.sort((a, b) => a.range.min - b.range.min);
    for (let i = 0; i < sortedRanges.length - 1; i++) {
      if (sortedRanges[i].range.max >= sortedRanges[i + 1].range.min) {
        throw new BadRequestException('Los rangos no deben solaparse');
      }
    }
  }
}

