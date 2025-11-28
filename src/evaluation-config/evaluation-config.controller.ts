import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { EvaluationConfigService } from './evaluation-config.service';
import { CreateEvaluationConfigDto } from './dto/create-evaluation-config.dto';
import { UpdateEvaluationConfigDto } from './dto/update-evaluation-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../schemas/user.schema';

@ApiTags('evaluation-config')
@ApiBearerAuth('JWT-auth')
@Controller('evaluation-config')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class EvaluationConfigController {
  constructor(private readonly configService: EvaluationConfigService) {}

  @Post()
  @ApiOperation({ summary: 'Crear configuración de evaluación (Solo Admin)' })
  @ApiResponse({ status: 201, description: 'Configuración creada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tienes permisos de administrador' })
  async create(@Body() createConfigDto: CreateEvaluationConfigDto) {
    return this.configService.create(createConfigDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las configuraciones (Solo Admin)' })
  @ApiQuery({ name: 'sectionId', required: false, description: 'Filtrar por ID de sección' })
  @ApiResponse({ status: 200, description: 'Lista de configuraciones' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tienes permisos de administrador' })
  async findAll(@Query('sectionId') sectionId?: string) {
    if (sectionId) {
      const config = await this.configService.findBySection(sectionId);
      return config ? [config] : [];
    }
    return this.configService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.configService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateConfigDto: UpdateEvaluationConfigDto) {
    return this.configService.update(id, updateConfigDto);
  }

  @Patch(':id/toggle-active')
  async toggleActive(@Param('id') id: string) {
    return this.configService.toggleActive(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.configService.remove(id);
  }
}

