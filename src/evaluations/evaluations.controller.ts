import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../schemas/user.schema';

@ApiTags('evaluations')
@ApiBearerAuth('JWT-auth')
@Controller('evaluations')
@UseGuards(JwtAuthGuard)
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva evaluación' })
  @ApiResponse({ status: 201, description: 'Evaluación creada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 409, description: 'Ya existe una evaluación para esta sección' })
  async create(@CurrentUser() user: any, @Body() createEvaluationDto: CreateEvaluationDto) {
    return this.evaluationsService.create(user._id || user.id, createEvaluationDto);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Iniciar una evaluación' })
  @ApiParam({ name: 'id', description: 'ID de la evaluación' })
  @ApiResponse({ status: 200, description: 'Evaluación iniciada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Evaluación no encontrada' })
  async startEvaluation(@CurrentUser() user: any, @Param('id') id: string) {
    return this.evaluationsService.startEvaluation(user._id || user.id, id);
  }

  @Post(':id/answers')
  @ApiOperation({ summary: 'Enviar una respuesta a una pregunta' })
  @ApiParam({ name: 'id', description: 'ID de la evaluación' })
  @ApiResponse({ status: 200, description: 'Respuesta enviada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Evaluación o pregunta no encontrada' })
  async submitAnswer(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() submitAnswerDto: SubmitAnswerDto,
  ) {
    return this.evaluationsService.submitAnswer(user._id || user.id, id, submitAnswerDto);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Completar una evaluación' })
  @ApiParam({ name: 'id', description: 'ID de la evaluación' })
  @ApiResponse({ status: 200, description: 'Evaluación completada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Evaluación no encontrada' })
  async completeEvaluation(@CurrentUser() user: any, @Param('id') id: string) {
    return this.evaluationsService.completeEvaluation(user._id || user.id, id);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener evaluaciones del usuario autenticado' })
  @ApiQuery({ name: 'sectionId', required: false, description: 'Filtrar por ID de sección' })
  @ApiResponse({ status: 200, description: 'Lista de evaluaciones' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async findByUser(@CurrentUser() user: any, @Query('sectionId') sectionId?: string) {
    if (sectionId) {
      return this.evaluationsService.findByUserAndSection(user._id || user.id, sectionId);
    }
    return this.evaluationsService.findByUser(user._id || user.id);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    // Los estudiantes solo pueden ver sus propias evaluaciones
    const userId = user.role === UserRole.ADMIN ? undefined : (user._id || user.id);
    return this.evaluationsService.getEvaluationWithAnswers(id, userId);
  }
}

