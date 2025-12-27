import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(registerDto: RegisterDto): Promise<UserDocument> {
    // Verificar si el usuario ya existe
    const existingUser = await this.userModel.findOne({ email: registerDto.email });
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Crear usuario
    const user = new this.userModel({
      ...registerDto,
      password: hashedPassword,
    });

    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async validatePassword(user: UserDocument, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findActiveStudents(): Promise<UserDocument[]> {
    return this.userModel.find({ role: 'student', isActive: true }).exec();
  }

  async findStudentsByCareer(career: string): Promise<UserDocument[]> {
    return this.userModel.find({ role: 'student', career, isActive: true }).exec();
  }

  async findStudentsByCourse(career: string, course: string): Promise<UserDocument[]> {
    return this.userModel.find({ role: 'student', career, course, isActive: true }).exec();
  }

  async update(id: string, updateData: Partial<UserDocument>): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }
}

