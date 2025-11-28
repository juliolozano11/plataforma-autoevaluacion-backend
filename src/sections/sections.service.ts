import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Section, SectionDocument } from '../schemas/section.schema';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionsService {
  constructor(
    @InjectModel(Section.name) private sectionModel: Model<SectionDocument>,
  ) {}

  async create(createSectionDto: CreateSectionDto): Promise<SectionDocument> {
    // Verificar si la sección ya existe
    const existingSection = await this.sectionModel.findOne({ name: createSectionDto.name });
    if (existingSection) {
      throw new ConflictException('La sección ya existe');
    }

    const section = new this.sectionModel(createSectionDto);
    return section.save();
  }

  async findAll(): Promise<SectionDocument[]> {
    return this.sectionModel.find().sort({ name: 1 }).exec();
  }

  async findActive(): Promise<SectionDocument[]> {
    return this.sectionModel.find({ isActive: true }).sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<SectionDocument> {
    const section = await this.sectionModel.findById(id).exec();
    if (!section) {
      throw new NotFoundException('Sección no encontrada');
    }
    return section;
  }

  async findByName(name: string): Promise<SectionDocument | null> {
    return this.sectionModel.findOne({ name }).exec();
  }

  async update(id: string, updateSectionDto: UpdateSectionDto): Promise<SectionDocument> {
    const section = await this.sectionModel.findByIdAndUpdate(
      id,
      updateSectionDto,
      { new: true },
    ).exec();

    if (!section) {
      throw new NotFoundException('Sección no encontrada');
    }

    return section;
  }

  async toggleActive(id: string): Promise<SectionDocument> {
    const section = await this.findOne(id);
    section.isActive = !section.isActive;
    return section.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.sectionModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Sección no encontrada');
    }
  }
}

