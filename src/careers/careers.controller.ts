import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CareersService } from './careers.service';
import { CreateCareerDto } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../schemas/user.schema';

@ApiTags('Careers')
@Controller('careers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear una nueva carrera' })
  @ApiResponse({ status: 201, description: 'Carrera creada exitosamente' })
  @ApiResponse({ status: 409, description: 'Ya existe una carrera con este nombre' })
  create(@Body() createCareerDto: CreateCareerDto) {
    return this.careersService.create(createCareerDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener todas las carreras' })
  @ApiResponse({ status: 200, description: 'Lista de carreras' })
  findAll() {
    return this.careersService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener carreras activas' })
  @ApiResponse({ status: 200, description: 'Lista de carreras activas' })
  findActive() {
    return this.careersService.findActive();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener una carrera por ID' })
  @ApiResponse({ status: 200, description: 'Carrera encontrada' })
  @ApiResponse({ status: 404, description: 'Carrera no encontrada' })
  findOne(@Param('id') id: string) {
    return this.careersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar una carrera' })
  @ApiResponse({ status: 200, description: 'Carrera actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Carrera no encontrada' })
  @ApiResponse({ status: 409, description: 'Ya existe una carrera con este nombre' })
  update(@Param('id') id: string, @Body() updateCareerDto: UpdateCareerDto) {
    return this.careersService.update(id, updateCareerDto);
  }

  @Patch(':id/toggle-active')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Activar/Desactivar una carrera' })
  @ApiResponse({ status: 200, description: 'Estado de la carrera actualizado' })
  @ApiResponse({ status: 404, description: 'Carrera no encontrada' })
  toggleActive(@Param('id') id: string) {
    return this.careersService.toggleActive(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar una carrera' })
  @ApiResponse({ status: 200, description: 'Carrera eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Carrera no encontrada' })
  remove(@Param('id') id: string) {
    return this.careersService.remove(id);
  }
}

