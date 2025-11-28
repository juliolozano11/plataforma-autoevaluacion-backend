import { IsEmail, IsString, MinLength, IsEnum, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../schemas/user.schema';

export class RegisterDto {
  @ApiProperty({
    example: 'estudiante.ejemplo@ug.edu.ec',
    description: 'Correo electrónico institucional de la Universidad de Guayaquil',
  })
  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  @Matches(/@ug\.edu\.ec$/, { message: 'El correo debe ser del dominio @ug.edu.ec' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
    minLength: 2,
  })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  firstName: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del usuario',
    minLength: 2,
  })
  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  lastName: string;

  @ApiProperty({
    example: UserRole.STUDENT,
    enum: UserRole,
    description: 'Rol del usuario (admin o student)',
    default: UserRole.STUDENT,
  })
  @IsEnum(UserRole, { message: 'El rol debe ser admin o student' })
  role: UserRole;

  @ApiProperty({
    example: 'Ingeniería en Sistemas',
    description: 'Carrera del estudiante (solo para estudiantes)',
    required: false,
  })
  @IsOptional()
  @IsString()
  career?: string;

  @ApiProperty({
    example: '8vo',
    description: 'Curso del estudiante (solo para estudiantes)',
    required: false,
  })
  @IsOptional()
  @IsString()
  course?: string;

  @ApiProperty({
    example: 'A',
    description: 'Paralelo del estudiante (solo para estudiantes)',
    required: false,
  })
  @IsOptional()
  @IsString()
  parallel?: string;
}

