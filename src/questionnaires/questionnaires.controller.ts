import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { QuestionnairesService } from './questionnaires.service';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import { UpdateQuestionnaireDto } from './dto/update-questionnaire.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../schemas/user.schema';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('questionnaires')
@Controller('questionnaires')
export class QuestionnairesController {
  constructor(private readonly questionnairesService: QuestionnairesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Crear un nuevo cuestionario (Solo Admin)' })
  @ApiResponse({ status: 201, description: 'Cuestionario creado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tienes permisos de administrador' })
  async create(@Body() createQuestionnaireDto: CreateQuestionnaireDto) {
    return this.questionnairesService.create(createQuestionnaireDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Obtener todos los cuestionarios' })
  @ApiQuery({ name: 'sectionId', required: false, description: 'Filtrar por ID de sección' })
  @ApiResponse({ status: 200, description: 'Lista de cuestionarios' })
  async findAll(@Query('sectionId') sectionId?: string) {
    if (sectionId) {
      return this.questionnairesService.findBySection(sectionId);
    }
    return this.questionnairesService.findAll();
  }

  @Get('active')
  @Public()
  @ApiOperation({ summary: 'Obtener cuestionarios activos' })
  @ApiQuery({ name: 'sectionId', required: false, description: 'Filtrar por ID de sección' })
  @ApiResponse({ status: 200, description: 'Lista de cuestionarios activos' })
  async findActive(@Query('sectionId') sectionId?: string) {
    if (sectionId) {
      return this.questionnairesService.findActiveBySection(sectionId);
    }
    // Si no hay sectionId, devolver todos los cuestionarios activos
    return this.questionnairesService.findActive();
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return this.questionnairesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateQuestionnaireDto: UpdateQuestionnaireDto) {
    return this.questionnairesService.update(id, updateQuestionnaireDto);
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async toggleActive(@Param('id') id: string) {
    return this.questionnairesService.toggleActive(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.questionnairesService.remove(id);
  }
}

