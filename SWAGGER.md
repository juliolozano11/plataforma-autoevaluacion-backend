# Documentación de Swagger

## Acceso a Swagger

Una vez que el servidor esté corriendo, puedes acceder a la documentación de Swagger en:

**URL:** `http://localhost:3000/api/docs`

## Características Configuradas

### Autenticación JWT

Swagger está configurado para soportar autenticación JWT:

1. **Iniciar sesión:**
   - Ve al endpoint `POST /api/auth/login`
   - Ingresa tus credenciales (email y password)
   - Ejecuta la petición
   - Copia el `accessToken` de la respuesta

2. **Autorizar en Swagger:**
   - Haz clic en el botón **"Authorize"** (candado) en la parte superior derecha
   - Pega el token JWT en el campo
   - Haz clic en **"Authorize"**
   - Ahora puedes probar los endpoints protegidos

### Endpoints Documentados

Los endpoints están organizados por tags:

- **auth**: Endpoints de autenticación (register, login, profile, refresh)
- **users**: Endpoints de usuarios
- **sections**: Endpoints de secciones
- **questionnaires**: Endpoints de cuestionarios
- **questions**: Endpoints de preguntas
- **evaluations**: Endpoints de evaluaciones
- **reports**: Endpoints de reportes
- **upload**: Endpoints de carga de archivos

## Uso de Swagger

### Probar Endpoints

1. **Expandir un endpoint:** Haz clic en el endpoint para ver sus detalles
2. **Ver esquemas:** Haz clic en "Schema" para ver la estructura de los DTOs
3. **Probar petición:** 
   - Completa los campos requeridos
   - Haz clic en "Try it out"
   - Completa los parámetros
   - Haz clic en "Execute"
4. **Ver respuesta:** La respuesta aparecerá debajo con el código de estado y el cuerpo

### Endpoints Públicos vs Protegidos

- **Endpoints públicos** (como `/auth/login` y `/auth/register`) no requieren autenticación
- **Endpoints protegidos** requieren el token JWT en el header `Authorization: Bearer <token>`

## Configuración

La configuración de Swagger se encuentra en `src/main.ts`:

```typescript
const config = new DocumentBuilder()
  .setTitle('API de Evaluación de Empleabilidad')
  .setDescription('...')
  .setVersion('1.0')
  .addBearerAuth(..., 'JWT-auth')
  .build();
```

## Personalización

Puedes agregar más decoradores a los controladores para mejorar la documentación:

```typescript
@ApiTags('nombre-del-tag')
@ApiOperation({ summary: 'Descripción del endpoint' })
@ApiResponse({ status: 200, description: 'Descripción de la respuesta' })
@ApiBearerAuth('JWT-auth') // Para endpoints protegidos
```

## Notas

- El token JWT se mantiene al recargar la página gracias a `persistAuthorization: true`
- Todos los endpoints están bajo el prefijo `/api`
- La documentación se genera automáticamente basándose en los decoradores de NestJS

