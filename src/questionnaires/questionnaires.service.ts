import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Questionnaire, QuestionnaireDocument } from '../schemas/questionnaire.schema';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import { UpdateQuestionnaireDto } from './dto/update-questionnaire.dto';

@Injectable()
export class QuestionnairesService {
  constructor(
    @InjectModel(Questionnaire.name) private questionnaireModel: Model<QuestionnaireDocument>,
  ) {}

  async create(createQuestionnaireDto: CreateQuestionnaireDto): Promise<QuestionnaireDocument> {
    const questionnaire = new this.questionnaireModel(createQuestionnaireDto);
    return questionnaire.save();
  }

  async findAll(): Promise<QuestionnaireDocument[]> {
    return this.questionnaireModel.find().populate('sectionId').sort({ createdAt: -1 }).exec();
  }

  async findBySection(sectionId: string): Promise<QuestionnaireDocument[]> {
    return this.questionnaireModel
      .find({ sectionId, isActive: true })
      .populate('sectionId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findActive(): Promise<QuestionnaireDocument[]> {
    return this.questionnaireModel
      .find({ isActive: true })
      .populate('sectionId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findActiveBySection(sectionId: string): Promise<QuestionnaireDocument[]> {
    return this.questionnaireModel
      .find({ sectionId, isActive: true })
      .populate('sectionId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<QuestionnaireDocument> {
    const questionnaire = await this.questionnaireModel
      .findById(id)
      .populate('sectionId')
      .exec();

    if (!questionnaire) {
      throw new NotFoundException('Cuestionario no encontrado');
    }

    return questionnaire;
  }

  async update(id: string, updateQuestionnaireDto: UpdateQuestionnaireDto): Promise<QuestionnaireDocument> {
    const questionnaire = await this.questionnaireModel
      .findByIdAndUpdate(id, updateQuestionnaireDto, { new: true })
      .populate('sectionId')
      .exec();

    if (!questionnaire) {
      throw new NotFoundException('Cuestionario no encontrado');
    }

    return questionnaire;
  }

  async toggleActive(id: string): Promise<QuestionnaireDocument> {
    const questionnaire = await this.findOne(id);
    questionnaire.isActive = !questionnaire.isActive;
    return questionnaire.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.questionnaireModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Cuestionario no encontrado');
    }
  }
}

