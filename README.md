<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Descripción

Backend de la plataforma de autoevaluación y diagnóstico de estudiantes de último semestre de la Facultad de Ciencias Matemáticas y Físicas de la Universidad de Guayaquil.

Desarrollado con NestJS, MongoDB (Mongoose) y TypeScript.

## Requisitos Previos

- Node.js (v18.19.1 o superior)
- MongoDB (local o remoto)
- npm o yarn

## Configuración del Proyecto

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `env.example` y crea un archivo `.env`:

```bash
cp env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
MONGODB_URI=mongodb://localhost:27017/evaluacion-empleabilidad
JWT_SECRET=tu-secreto-jwt-aqui
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=tu-secreto-refresh-aqui
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
```

### 3. Asegúrate de que MongoDB esté corriendo

Si usas MongoDB local:
```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
```

## Ejecutar el Proyecto

```bash
# Modo desarrollo (con hot-reload)
npm run start:dev

# Modo producción
npm run start:prod

# Modo normal
npm run start
```

El servidor estará disponible en `http://localhost:3000/api`

## Estructura del Proyecto

```
back/
├── src/
│   ├── schemas/          # Modelos Mongoose
│   │   ├── user.schema.ts
│   │   ├── section.schema.ts
│   │   ├── questionnaire.schema.ts
│   │   ├── question.schema.ts
│   │   ├── evaluation.schema.ts
│   │   ├── answer.schema.ts
│   │   └── evaluation-config.schema.ts
│   ├── auth/             # Módulo de autenticación
│   │   ├── dto/          # DTOs de validación
│   │   ├── guards/       # Guards de seguridad
│   │   ├── strategies/   # Estrategias Passport
│   │   ├── decorators/   # Decoradores personalizados
│   │   ├── interfaces/  # Interfaces TypeScript
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   └── auth.module.ts
│   ├── users/            # Módulo de usuarios
│   │   ├── users.service.ts
│   │   ├── users.controller.ts
│   │   └── users.module.ts
│   ├── config/           # Configuraciones
│   │   ├── database.config.ts
│   │   └── jwt.config.ts
│   ├── app.module.ts     # Módulo principal
│   └── main.ts           # Punto de entrada
├── test/                 # Tests
├── env.example           # Ejemplo de variables de entorno
└── package.json
```

## Modelos de Base de Datos

El proyecto incluye 7 modelos principales:

1. **User**: Usuarios (admin/estudiante)
2. **Section**: Secciones de evaluación (blandas, adaptativas, tecnológicas)
3. **Questionnaire**: Cuestionarios agrupados por sección
4. **Question**: Preguntas individuales
5. **Evaluation**: Evaluaciones realizadas por estudiantes
6. **Answer**: Respuestas a preguntas
7. **EvaluationConfig**: Configuración de niveles y umbrales

Ver documentación completa en:
- `docs/03-esquema-base-datos.md` - Esquema de base de datos
- `docs/04-implementacion-modelos.md` - Implementación de modelos
- `docs/05-implementacion-autenticacion.md` - Módulos de autenticación y usuarios

## Scripts Disponibles

```bash
# Desarrollo
npm run start:dev

# Producción
npm run start:prod

# Build
npm run build

# Tests
npm run test
npm run test:e2e
npm run test:cov
```

## Tecnologías Utilizadas

- **NestJS**: Framework Node.js
- **Mongoose**: ODM para MongoDB
- **TypeScript**: Lenguaje de programación
- **Passport + JWT**: Autenticación
- **bcrypt**: Hash de contraseñas
- **class-validator**: Validación de DTOs
- **@nestjs/config**: Gestión de configuración

## Módulos Implementados

### ✅ Autenticación
- Registro de usuarios con validación de dominio @ug.edu.ec
- Login con JWT (access + refresh tokens)
- Guards de autenticación y roles
- Decoradores personalizados (@Public, @Roles, @CurrentUser)

### ✅ Usuarios
- CRUD completo de usuarios
- Filtrado de estudiantes por carrera/curso
- Gestión de perfiles

### ⏭️ Próximos Módulos
- Preguntas y Cuestionarios
- Evaluaciones
- Reportes
- Carga de archivos (Excel/CSV)

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
