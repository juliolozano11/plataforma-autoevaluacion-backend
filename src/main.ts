import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: false,
  });

  // Obtener configuración
  const configService = app.get(ConfigService);

  // Railway asigna el puerto en process.env.PORT.
  // Si no existe (por ejemplo en local), usamos 3000.
  const rawPort = process.env.PORT || '3000';
  const port = parseInt(rawPort, 10);

  const corsOrigin =
    configService.get<string>('CORS_ORIGIN') || process.env.CORS_ORIGIN || '*';

  console.log('🔧 process.env.PORT =', process.env.PORT);
  console.log('🔧 Puerto efectivo =', port);
  console.log('🔧 CORS Origin =', corsOrigin);

  // Health check en la raíz - fuera de Nest, sin guards ni prefijos
  const httpAdapter = app.getHttpAdapter();
  const instance = httpAdapter.getInstance();
  instance.get('/', (req: any, res: any) => {
    console.log('✅ Health check recibido en /');
    res.status(200).json({
      message: 'API de Evaluación de Empleabilidad',
      status: 'running',
      docs: '/api/docs',
      timestamp: new Date().toISOString(),
    });
  });
  console.log('✅ Health check route registrado en /');

  // Configurar CORS
  // En desarrollo, permitir múltiples orígenes comunes
  const isDevelopment = process.env.NODE_ENV !== 'production';
  let allowedOrigins: string[] | boolean | ((origin: string, callback: (err: Error | null, allow?: boolean) => void) => void);
  
  if (corsOrigin === '*') {
    allowedOrigins = true; // Permitir todos los orígenes
  } else if (isDevelopment) {
    // En desarrollo, permitir localhost en diferentes puertos
    const devOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      corsOrigin, // También incluir el origen configurado
    ].filter(Boolean);
    
    // Usar función para permitir cualquier origen localhost en desarrollo
    allowedOrigins = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Permitir requests sin origin (como Postman, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }
      
      // Permitir cualquier localhost o 127.0.0.1
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
      
      // Permitir orígenes específicos configurados
      if (devOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    };
  } else {
    // En producción, usar solo el origen configurado
    allowedOrigins = corsOrigin.split(',').map((origin) => origin.trim());
  }

  // Habilitar CORS
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Type'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  
  console.log('🔧 CORS configurado para desarrollo:', isDevelopment);
  console.log('🔧 Orígenes permitidos:', corsOrigin === '*' ? 'Todos (*)' : (isDevelopment ? 'Localhost en cualquier puerto' : corsOrigin));

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Prefijo global para API
  app.setGlobalPrefix('api');

  // Guard global de autenticación
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

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
      'JWT-auth',
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
      persistAuthorization: true,
    },
  });

  try {
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Servidor corriendo en http://0.0.0.0:${port}/api`);
    console.log(`📚 Swagger disponible en http://0.0.0.0:${port}/api/docs`);
    console.log(
      `📦 Base de datos: ${
        configService
          .get<string>('database.uri')
          ?.replace(/\/\/.*@/, '//***:***@') || 'No configurada'
      }`,
    );
    console.log(
      `✅ Aplicación lista para recibir peticiones en el puerto ${port}`,
    );
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('❌ Error fatal al iniciar la aplicación:', error);
  process.exit(1);
});
