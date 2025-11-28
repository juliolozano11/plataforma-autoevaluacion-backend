import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../schemas/user.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('reports')
@ApiBearerAuth('JWT-auth')
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // Reporte individual
  @Get('individual')
  @ApiOperation({ summary: 'Obtener reporte individual del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Reporte individual' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getIndividualReport(@CurrentUser() user: any) {
    const userId = user.role === UserRole.ADMIN && user.queryUserId 
      ? user.queryUserId 
      : (user._id || user.id);
    return this.reportsService.getIndividualReport(userId);
  }

  @Get('individual/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener reporte individual por ID de usuario (Solo Admin)' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Reporte individual' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tienes permisos de administrador' })
  async getIndividualReportById(@Param('userId') userId: string) {
    return this.reportsService.getIndividualReport(userId);
  }

  // Reporte grupal por carrera
  @Get('group/career')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener reporte grupal por carrera (Solo Admin)' })
  @ApiQuery({ name: 'career', required: true, description: 'Nombre de la carrera' })
  @ApiQuery({ name: 'sectionId', required: false, description: 'Filtrar por ID de sección' })
  @ApiResponse({ status: 200, description: 'Reporte grupal por carrera' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tienes permisos de administrador' })
  async getGroupReportByCareer(
    @Query('career') career: string,
    @Query('sectionId') sectionId?: string,
  ) {
    if (!career) {
      throw new Error('El parámetro career es requerido');
    }
    return this.reportsService.getGroupReportByCareer(career, sectionId);
  }

  // Reporte grupal por curso
  @Get('group/course')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener reporte grupal por curso (Solo Admin)' })
  @ApiQuery({ name: 'career', required: true, description: 'Nombre de la carrera' })
  @ApiQuery({ name: 'course', required: true, description: 'Nombre del curso' })
  @ApiQuery({ name: 'sectionId', required: false, description: 'Filtrar por ID de sección' })
  @ApiResponse({ status: 200, description: 'Reporte grupal por curso' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tienes permisos de administrador' })
  async getGroupReportByCourse(
    @Query('career') career: string,
    @Query('course') course: string,
    @Query('sectionId') sectionId?: string,
  ) {
    if (!career || !course) {
      throw new Error('Los parámetros career y course son requeridos');
    }
    return this.reportsService.getGroupReportByCourse(career, course, sectionId);
  }

  // Panel de consulta de avance
  @Get('progress')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener panel de progreso (Solo Admin)' })
  @ApiQuery({ name: 'sectionId', required: false, description: 'Filtrar por ID de sección' })
  @ApiResponse({ status: 200, description: 'Panel de progreso' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tienes permisos de administrador' })
  async getProgressPanel(@Query('sectionId') sectionId?: string) {
    return this.reportsService.getProgressPanel(sectionId);
  }

  // Distribución de niveles por competencia
  @Get('levels-distribution')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener distribución de niveles por competencia (Solo Admin)' })
  @ApiResponse({ status: 200, description: 'Distribución de niveles' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tienes permisos de administrador' })
  async getLevelsDistributionByCompetence() {
    return this.reportsService.getLevelsDistributionByCompetence();
  }
}

