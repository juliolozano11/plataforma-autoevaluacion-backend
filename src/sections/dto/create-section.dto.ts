import { IsEnum, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SectionName } from '../../schemas/section.schema';

export class CreateSectionDto {
  @ApiProperty({
    example: SectionName.BLANDAS,
    enum: SectionName,
    description: 'Nombre de la sección (blandas, adaptativas, tecnologicas)',
  })
  @IsEnum(SectionName, { message: 'El nombre debe ser uno de: blandas, adaptativas, tecnologicas' })
  name: SectionName;

  @ApiProperty({
    example: 'Habilidades Blandas',
    description: 'Nombre de visualización de la sección',
    minLength: 3,
  })
  @IsString()
  @MinLength(3, { message: 'El nombre de visualización debe tener al menos 3 caracteres' })
  displayName: string;

  @ApiProperty({
    example: 'Evaluación de habilidades interpersonales y de comunicación',
    description: 'Descripción de la sección',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

