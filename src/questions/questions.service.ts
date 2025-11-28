import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument, QuestionType } from '../schemas/question.schema';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { BulkCreateQuestionsDto } from './dto/bulk-create-questions.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
  ) {}

  async create(createQuestionDto: CreateQuestionDto): Promise<QuestionDocument> {
    this.validateQuestionType(createQuestionDto);
    
    const question = new this.questionModel(createQuestionDto);
    return question.save();
  }

  async bulkCreate(bulkCreateDto: BulkCreateQuestionsDto): Promise<QuestionDocument[]> {
    const questions = bulkCreateDto.questions.map(q => ({
      ...q,
      questionnaireId: bulkCreateDto.questionnaireId,
    }));

    // Validar cada pregunta
    questions.forEach(q => this.validateQuestionType(q));

    const created = await this.questionModel.insertMany(questions);
    return created as unknown as QuestionDocument[];
  }

  async findAll(): Promise<QuestionDocument[]> {
    return this.questionModel.find().populate('questionnaireId').sort({ order: 1 }).exec();
  }

  async findByQuestionnaire(questionnaireId: string): Promise<QuestionDocument[]> {
    return this.questionModel
      .find({ questionnaireId, isActive: true })
      .populate('questionnaireId')
      .sort({ order: 1 })
      .exec();
  }

  async findOne(id: string): Promise<QuestionDocument> {
    const question = await this.questionModel
      .findById(id)
      .populate('questionnaireId')
      .exec();

    if (!question) {
      throw new NotFoundException('Pregunta no encontrada');
    }

    return question;
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto): Promise<QuestionDocument> {
    const question = await this.questionModel.findById(id).exec();
    if (!question) {
      throw new NotFoundException('Pregunta no encontrada');
    }

    // Validar si cambia el tipo
    const merged = { ...question.toObject(), ...updateQuestionDto };
    if (merged.type && merged.type !== question.type) {
      this.validateQuestionType(merged);
    }

    const updated = await this.questionModel
      .findByIdAndUpdate(id, updateQuestionDto, { new: true })
      .populate('questionnaireId')
      .exec();

    if (!updated) {
      throw new NotFoundException('Pregunta no encontrada');
    }

    return updated;
  }

  async reorder(questionnaireId: string, questionIds: string[]): Promise<void> {
    const updates = questionIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, questionnaireId },
        update: { $set: { order: index + 1 } },
      },
    }));

    await this.questionModel.bulkWrite(updates);
  }

  async toggleActive(id: string): Promise<QuestionDocument> {
    const question = await this.findOne(id);
    question.isActive = !question.isActive;
    return question.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.questionModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Pregunta no encontrada');
    }
  }

  async removeByQuestionnaire(questionnaireId: string): Promise<void> {
    await this.questionModel.deleteMany({ questionnaireId });
  }

  private validateQuestionType(question: CreateQuestionDto | any): void {
    if (question.type === QuestionType.MULTIPLE_CHOICE) {
      if (!question.options || question.options.length < 2) {
        throw new BadRequestException('Las preguntas de opción múltiple deben tener al menos 2 opciones');
      }
    } else if (question.type === QuestionType.SCALE) {
      // Las preguntas de escala no requieren opciones
      if (question.options) {
        throw new BadRequestException('Las preguntas de escala no deben tener opciones');
      }
    } else if (question.type === QuestionType.TEXT) {
      // Las preguntas de texto no requieren opciones
      if (question.options) {
        throw new BadRequestException('Las preguntas de texto no deben tener opciones');
      }
    }
  }
}

