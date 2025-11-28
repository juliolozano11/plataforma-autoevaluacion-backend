import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Obtener configuración
  const configService = app.get(ConfigService);
  // Railway asigna el puerto automáticamente, usar process.env.PORT directamente
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : (configService.get<number>('PORT') || 3000);
  const corsOrigin = configService.get<string>('CORS_ORIGIN') || '*';

  // Habilitar CORS
  app.enableCors({
    origin: corsOrigin === '*' ? true : corsOrigin,
    credentials: true,
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Guard global de autenticación (con soporte para rutas públicas)
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // Health check en la raíz ANTES del prefijo global
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/', (req: any, res: any) => {
    res.json({
      message: 'API de Evaluación de Empleabilidad',
      status: 'running',
      docs: '/api/docs',
    });
  });

  // Prefijo global para API
  app.setGlobalPrefix('api');

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Evaluación de Empleabilidad')
    .setDescription(
      'API para el sistema de autoevaluación y diagnóstico de estudiantes del último semestre de la Universidad de Guayaquil, Facultad de Ciencias Matemáticas y Físicas.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa el token JWT',
        in: 'header',
      },
      'JWT-auth', // Este nombre se usará en los decoradores @ApiBearerAuth()
    )
    .addTag('auth', 'Endpoints de autenticación')
    .addTag('users', 'Endpoints de usuarios')
    .addTag('sections', 'Endpoints de secciones')
    .addTag('questionnaires', 'Endpoints de cuestionarios')
    .addTag('questions', 'Endpoints de preguntas')
    .addTag('evaluations', 'Endpoints de evaluaciones')
    .addTag('reports', 'Endpoints de reportes')
    .addTag('upload', 'Endpoints de carga de archivos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Mantiene el token al recargar la página
    },
  });

  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Servidor corriendo en http://0.0.0.0:${port}/api`);
  console.log(`📚 Swagger disponible en http://0.0.0.0:${port}/api/docs`);
  console.log(`📦 Base de datos: ${configService.get<string>('database.uri')?.replace(/\/\/.*@/, '//***:***@') || 'No configurada'}`);
}
bootstrap();
