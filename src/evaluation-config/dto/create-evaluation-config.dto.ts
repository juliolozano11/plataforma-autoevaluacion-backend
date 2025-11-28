import { IsMongoId, IsObject, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class RangeDto {
  @ApiProperty({ example: 0, description: 'Valor mínimo del rango', minimum: 0 })
  @Min(0)
  min: number;

  @ApiProperty({ example: 20, description: 'Valor máximo del rango', maximum: 100 })
  @Max(100)
  max: number;
}

export class CreateEvaluationConfigDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID de la sección para la cual se configura la evaluación',
  })
  @IsMongoId({ message: 'El ID de la sección debe ser válido' })
  sectionId: string;

  @ApiProperty({
    example: { min: 0, max: 20 },
    description: 'Rango para nivel muy bajo',
    type: RangeDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => RangeDto)
  muyBajo: RangeDto;

  @ApiProperty({
    example: { min: 21, max: 40 },
    description: 'Rango para nivel bajo',
    type: RangeDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => RangeDto)
  bajo: RangeDto;

  @ApiProperty({
    example: { min: 41, max: 60 },
    description: 'Rango para nivel intermedio',
    type: RangeDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => RangeDto)
  intermedio: RangeDto;

  @ApiProperty({
    example: { min: 61, max: 80 },
    description: 'Rango para nivel alto',
    type: RangeDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => RangeDto)
  alto: RangeDto;

  @ApiProperty({
    example: { min: 81, max: 100 },
    description: 'Rango para nivel muy alto',
    type: RangeDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => RangeDto)
  muyAlto: RangeDto;
}

