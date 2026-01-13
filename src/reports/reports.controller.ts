import { Controller, Get, Param, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
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

  // Exportar reporte general a Excel (debe ir antes de las rutas más generales)
  @Get('export/general')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Exportar reporte general a Excel (Solo Admin)' })
  @ApiResponse({ status: 200, description: 'Archivo Excel descargado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tienes permisos de administrador' })
  async exportGeneralReport(@Res() res: Response) {
    try {
      const workbook = await this.reportsService.exportGeneralReportToExcel();
      const buffer = await workbook.xlsx.writeBuffer();

      const filename = `reporte-general-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );

      return res.send(buffer);
    } catch (error) {
      console.error('Error al exportar reporte general:', error);
      return res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al generar el reporte',
        error: 'Internal Server Error',
      });
    }
  }

  // Exportar reporte grupal por carrera a Excel (debe ir antes de las rutas más generales)
  @Get('export/group/career')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Exportar reporte grupal por carrera a Excel (Solo Admin)' })
  @ApiQuery({ name: 'career', required: true, description: 'Nombre de la carrera' })
  @ApiQuery({ name: 'sectionId', required: false, description: 'Filtrar por ID de sección' })
  @ApiResponse({ status: 200, description: 'Archivo Excel descargado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tienes permisos de administrador' })
  async exportGroupReportByCareer(
    @Query('career') career: string,
    @Query('sectionId') sectionId: string | undefined,
    @Res() res: Response,
  ) {
    try {
      if (!career) {
        return res.status(400).json({
          message: 'El parámetro career es requerido',
          error: 'Bad Request',
        });
      }

      const workbook = await this.reportsService.exportGroupReportByCareerToExcel(
        career,
        sectionId,
      );
      const buffer = await workbook.xlsx.writeBuffer();

      const safeCareer = career.replace(/[^a-zA-Z0-9-_]/g, '_');
      const filename = `reporte-grupal-carrera-${safeCareer}-${new Date().toISOString().split('T')[0]}.xlsx`;

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );

      return res.send(buffer);
    } catch (error) {
      console.error('Error al exportar reporte grupal por carrera:', error);
      return res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al generar el reporte',
        error: 'Internal Server Error',
      });
    }
  }

  // Exportar reporte grupal por curso a Excel (debe ir antes de las rutas más generales)
  @Get('export/group/course')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Exportar reporte grupal por curso a Excel (Solo Admin)' })
  @ApiQuery({ name: 'career', required: true, description: 'Nombre de la carrera' })
  @ApiQuery({ name: 'course', required: true, description: 'Nombre del curso' })
  @ApiQuery({ name: 'sectionId', required: false, description: 'Filtrar por ID de sección' })
  @ApiResponse({ status: 200, description: 'Archivo Excel descargado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tienes permisos de administrador' })
  async exportGroupReportByCourse(
    @Query('career') career: string,
    @Query('course') course: string,
    @Query('sectionId') sectionId: string | undefined,
    @Res() res: Response,
  ) {
    try {
      if (!career || !course) {
        return res.status(400).json({
          message: 'Los parámetros career y course son requeridos',
          error: 'Bad Request',
        });
      }

      const workbook = await this.reportsService.exportGroupReportByCourseToExcel(
        career,
        course,
        sectionId,
      );
      const buffer = await workbook.xlsx.writeBuffer();

      const safeCareer = career.replace(/[^a-zA-Z0-9-_]/g, '_');
      const safeCourse = course.replace(/[^a-zA-Z0-9-_]/g, '_');
      const filename = `reporte-grupal-curso-${safeCareer}-${safeCourse}-${new Date().toISOString().split('T')[0]}.xlsx`;

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );

      return res.send(buffer);
    } catch (error) {
      console.error('Error al exportar reporte grupal por curso:', error);
      return res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al generar el reporte',
        error: 'Internal Server Error',
      });
    }
  }

  // Exportar reporte grupal por paralelo a Excel (debe ir antes de las rutas más generales)
  @Get('export/group/parallel')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Exportar reporte grupal por paralelo a Excel (Solo Admin)' })
  @ApiQuery({ name: 'career', required: true, description: 'Nombre de la carrera' })
  @ApiQuery({ name: 'course', required: true, description: 'Nombre del curso' })
  @ApiQuery({ name: 'parallel', required: true, description: 'Nombre del paralelo' })
  @ApiQuery({ name: 'sectionId', required: false, description: 'Filtrar por ID de sección' })
  @ApiResponse({ status: 200, description: 'Archivo Excel descargado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tienes permisos de administrador' })
  async exportGroupReportByParallel(
    @Query('career') career: string,
    @Query('course') course: string,
    @Query('parallel') parallel: string,
    @Query('sectionId') sectionId: string | undefined,
    @Res() res: Response,
  ) {
    try {
      if (!career || !course || !parallel) {
        return res.status(400).json({
          message: 'Los parámetros career, course y parallel son requeridos',
          error: 'Bad Request',
        });
      }

      const workbook = await this.reportsService.exportGroupReportByParallelToExcel(
        career,
        course,
        parallel,
        sectionId,
      );
      const buffer = await workbook.xlsx.writeBuffer();

      const safeCareer = career.replace(/[^a-zA-Z0-9-_]/g, '_');
      const safeCourse = course.replace(/[^a-zA-Z0-9-_]/g, '_');
      const safeParallel = parallel.replace(/[^a-zA-Z0-9-_]/g, '_');
      const filename = `reporte-grupal-paralelo-${safeCareer}-${safeCourse}-${safeParallel}-${new Date().toISOString().split('T')[0]}.xlsx`;

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );

      return res.send(buffer);
    } catch (error) {
      console.error('Error al exportar reporte grupal por paralelo:', error);
      return res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al generar el reporte',
        error: 'Internal Server Error',
      });
    }
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

  // Endpoint de debug temporal para diagnosticar problemas
  @Get('debug/evaluations')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Debug: Ver todas las evaluaciones (Solo Admin)' })
  @ApiQuery({ name: 'sectionId', required: false, description: 'Filtrar por ID de sección' })
  async debugEvaluations(@Query('sectionId') sectionId?: string) {
    return this.reportsService.debugEvaluations(sectionId);
  }

}

