import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { UploadQuestionsDto } from './dto/upload-questions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../schemas/user.schema';
import { memoryStorage } from 'multer';

@ApiTags('upload')
@ApiBearerAuth('JWT-auth')
@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('questions')
  @ApiOperation({ summary: 'Cargar preguntas desde archivo Excel o CSV (Solo Admin)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo Excel (.xlsx, .xls) o CSV (.csv)',
        },
        questionnaireId: {
          type: 'string',
          example: '507f1f77bcf86cd799439011',
          description: 'ID del cuestionario',
        },
        format: {
          type: 'string',
          enum: ['excel', 'csv'],
          example: 'excel',
          description: 'Formato del archivo',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Preguntas cargadas exitosamente' })
  @ApiResponse({ status: 400, description: 'Archivo inválido o formato no soportado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tienes permisos de administrador' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
          'application/vnd.ms-excel', // .xls
          'text/csv', // .csv
          'application/csv', // .csv
        ];

        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Formato de archivo no permitido. Use Excel (.xlsx, .xls) o CSV (.csv)'), false);
        }
      },
    }),
  )
  async uploadQuestions(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadQuestionsDto,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    // Determinar formato por extensión o mimetype
    const fileName = file.originalname.toLowerCase();
    let format: 'excel' | 'csv' = uploadDto.format;

    if (!format) {
      if (fileName.endsWith('.csv') || file.mimetype.includes('csv')) {
        format = 'csv';
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || file.mimetype.includes('excel') || file.mimetype.includes('spreadsheet')) {
        format = 'excel';
      } else {
        throw new BadRequestException('No se pudo determinar el formato del archivo');
      }
    }

    if (format === 'excel') {
      return this.uploadService.processExcelFile(file, uploadDto.questionnaireId);
    } else {
      return this.uploadService.processCsvFile(file, uploadDto.questionnaireId);
    }
  }

  @Post('format-info')
  @ApiOperation({ summary: 'Obtener información del formato esperado (Solo Admin)' })
  @ApiResponse({ status: 200, description: 'Información del formato' })
  @ApiResponse({ status: 400, description: 'Formato inválido' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tienes permisos de administrador' })
  async getFormatInfo(@Body('format') format: 'excel' | 'csv') {
    if (!format || !['excel', 'csv'].includes(format)) {
      throw new BadRequestException('Formato debe ser excel o csv');
    }
    return this.uploadService.getExpectedFormat(format);
  }
}

