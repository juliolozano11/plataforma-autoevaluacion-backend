import { IsEmail, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'estudiante@ug.edu.ec',
    description: 'Correo electrónico institucional de la Universidad de Guayaquil',
  })
  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  @Matches(/@ug\.edu\.ec$/, { message: 'El correo debe ser del dominio @ug.edu.ec' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Contraseña del usuario',
  })
  @IsString()
  password: string;
}

