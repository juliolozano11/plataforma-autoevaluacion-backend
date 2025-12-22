import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { EvaluationConfigModule } from './evaluation-config/evaluation-config.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { QuestionnairesModule } from './questionnaires/questionnaires.module';
import { QuestionsModule } from './questions/questions.module';
import { ReportsModule } from './reports/reports.module';
import { SectionsModule } from './sections/sections.module';
import { CareersModule } from './careers/careers.module';
import { SeedModule } from './seed/seed.module';
import { UploadModule } from './upload/upload.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
    }),
    // Conexión a MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('database.uri');
        if (!uri) {
          throw new Error(
            '❌ MONGODB_URI no está configurada en el archivo .env. Por favor, configura la variable MONGODB_URI antes de iniciar la aplicación.',
          );
        }
        const options = configService.get('database.options') || {};
        console.log(
          `📦 Intentando conectar a MongoDB: ${uri.replace(/\/\/.*@/, '//***:***@')}`,
        );
        return {
          uri,
          ...options,
          retryWrites: true,
          retryReads: true,
        };
      },
      inject: [ConfigService],
    }),
    // Módulos de la aplicación
    AuthModule,
    UsersModule,
    SectionsModule,
    CareersModule,
    QuestionnairesModule,
    QuestionsModule,
    EvaluationConfigModule,
    EvaluationsModule,
    ReportsModule,
    UploadModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
