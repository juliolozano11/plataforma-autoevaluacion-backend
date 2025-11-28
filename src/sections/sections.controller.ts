import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../schemas/user.schema';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('sections')
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Crear una nueva sección (Solo Admin)' })
  @ApiResponse({ status: 201, description: 'Sección creada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tienes permisos de administrador' })
  async create(@Body() createSectionDto: CreateSectionDto) {
    return this.sectionsService.create(createSectionDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Obtener todas las secciones' })
  @ApiResponse({ status: 200, description: 'Lista de secciones' })
  async findAll() {
    return this.sectionsService.findAll();
  }

  @Get('active')
  @Public()
  @ApiOperation({ summary: 'Obtener secciones activas' })
  @ApiResponse({ status: 200, description: 'Lista de secciones activas' })
  async findActive() {
    return this.sectionsService.findActive();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obtener una sección por ID' })
  @ApiParam({ name: 'id', description: 'ID de la sección' })
  @ApiResponse({ status: 200, description: 'Sección encontrada' })
  @ApiResponse({ status: 404, description: 'Sección no encontrada' })
  async findOne(@Param('id') id: string) {
    return this.sectionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateSectionDto: UpdateSectionDto) {
    return this.sectionsService.update(id, updateSectionDto);
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async toggleActive(@Param('id') id: string) {
    return this.sectionsService.toggleActive(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.sectionsService.remove(id);
  }
}

