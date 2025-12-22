import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Career, CareerDocument } from '../schemas/career.schema';
import { CreateCareerDto } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';

@Injectable()
export class CareersService {
  constructor(
    @InjectModel(Career.name) private careerModel: Model<CareerDocument>,
  ) {}

  async create(createCareerDto: CreateCareerDto): Promise<CareerDocument> {
    // Verificar si ya existe una carrera con el mismo nombre
    const existing = await this.careerModel.findOne({
      name: createCareerDto.name,
    });

    if (existing) {
      throw new ConflictException('Ya existe una carrera con este nombre');
    }

    const career = new this.careerModel(createCareerDto);
    return career.save();
  }

  async findAll(): Promise<CareerDocument[]> {
    return this.careerModel.find().sort({ name: 1 }).exec();
  }

  async findActive(): Promise<CareerDocument[]> {
    return this.careerModel.find({ isActive: true }).sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<CareerDocument> {
    const career = await this.careerModel.findById(id).exec();
    if (!career) {
      throw new NotFoundException('Carrera no encontrada');
    }
    return career;
  }

  async update(id: string, updateCareerDto: UpdateCareerDto): Promise<CareerDocument> {
    // Si se está actualizando el nombre, verificar que no exista otra carrera con ese nombre
    if (updateCareerDto.name) {
      const existing = await this.careerModel.findOne({
        name: updateCareerDto.name,
        _id: { $ne: id },
      });

      if (existing) {
        throw new ConflictException('Ya existe una carrera con este nombre');
      }
    }

    const career = await this.careerModel
      .findByIdAndUpdate(id, updateCareerDto, { new: true })
      .exec();

    if (!career) {
      throw new NotFoundException('Carrera no encontrada');
    }

    return career;
  }

  async toggleActive(id: string): Promise<CareerDocument> {
    const career = await this.careerModel.findById(id).exec();
    if (!career) {
      throw new NotFoundException('Carrera no encontrada');
    }

    career.isActive = !career.isActive;
    return career.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.careerModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Carrera no encontrada');
    }
  }
}

