import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    // Solo ejecutar en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      await this.seedUsers();
    }
  }

  async seedUsers() {
    try {
      // Verificar si ya existen usuarios
      const userCount = await this.userModel.countDocuments();
      
      if (userCount > 0) {
        console.log('✅ Usuarios ya existen en la base de datos, omitiendo seed');
        return;
      }

      console.log('🌱 Iniciando seed de usuarios...');

      // Hash de contraseña por defecto: "password123"
      const defaultPassword = await bcrypt.hash('password123', 10);

      // Usuario Administrador
      const admin = await this.userModel.create({
        email: 'admin@ug.edu.ec',
        password: defaultPassword,
        firstName: 'Administrador',
        lastName: 'Sistema',
        role: UserRole.ADMIN,
        isActive: true,
      });

      // Usuario Estudiante
      const student = await this.userModel.create({
        email: 'estudiante@ug.edu.ec',
        password: defaultPassword,
        firstName: 'Estudiante',
        lastName: 'Prueba',
        role: UserRole.STUDENT,
        career: 'Ingeniería en Sistemas',
        course: '8vo',
        parallel: 'A',
        isActive: true,
      });

      console.log('✅ Usuarios de prueba creados exitosamente:');
      console.log(`   👤 Admin: ${admin.email} (password: password123)`);
      console.log(`   👤 Estudiante: ${student.email} (password: password123)`);
    } catch (error) {
      console.error('❌ Error al crear usuarios de prueba:', error.message);
    }
  }

  // Método para ejecutar manualmente
  async runSeed() {
    await this.seedUsers();
  }
}

