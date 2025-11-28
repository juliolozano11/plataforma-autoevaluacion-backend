import { Injectable, BadRequestException } from '@nestjs/common';
import { QuestionsService } from '../questions/questions.service';
import { QuestionnairesService } from '../questionnaires/questionnaires.service';
import { QuestionType } from '../schemas/question.schema';
import * as ExcelJS from 'exceljs';
import csv from 'csv-parser';
import { Readable } from 'stream';

interface QuestionRow {
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswer?: string;
  points: number;
  order: number;
}

@Injectable()
export class UploadService {
  constructor(
    private questionsService: QuestionsService,
    private questionnairesService: QuestionnairesService,
  ) {}

  async processExcelFile(file: Express.Multer.File, questionnaireId: string): Promise<any> {
    try {
      // Verificar que el cuestionario existe
      await this.questionnairesService.findOne(questionnaireId);

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(file.buffer as any);

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new BadRequestException('El archivo Excel no contiene hojas');
      }

      const questions: QuestionRow[] = [];
      let rowNumber = 0;

      worksheet.eachRow((row, rowIndex) => {
        // Saltar la primera fila (encabezados)
        if (rowIndex === 1) {
          rowNumber++;
          return;
        }

        const rowData: any = {};
        row.eachCell((cell, colNumber) => {
          const header = worksheet.getRow(1).getCell(colNumber).value?.toString().toLowerCase();
          if (header) {
            rowData[header] = cell.value?.toString() || '';
          }
        });

        // Validar y mapear datos
        if (rowData.text && rowData.type) {
          const question: QuestionRow = {
            text: rowData.text.trim(),
            type: this.normalizeType(rowData.type),
            points: parseInt(rowData.points) || 1,
            order: parseInt(rowData.order) || rowIndex,
          };

          // Procesar opciones si es multiple_choice
          if (question.type === QuestionType.MULTIPLE_CHOICE && rowData.options) {
            question.options = rowData.options.split(',').map((opt: string) => opt.trim());
          }

          // Procesar respuesta correcta si existe
          if (rowData.correctanswer) {
            question.correctAnswer = rowData.correctanswer.trim();
          }

          questions.push(question);
        }
        rowNumber++;
      });

      if (questions.length === 0) {
        throw new BadRequestException('No se encontraron preguntas válidas en el archivo');
      }

        // Crear preguntas en bulk
        const created = await this.questionsService.bulkCreate({
          questionnaireId,
          questions: questions.map(q => ({
            text: q.text,
            type: q.type,
            options: q.options,
            correctAnswer: q.correctAnswer,
            points: q.points,
            order: q.order,
          })),
        });

      return {
        success: true,
        message: `Se procesaron ${questions.length} preguntas`,
        created: created.length,
        questions: created,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al procesar archivo Excel: ${error.message}`);
    }
  }

  async processCsvFile(file: Express.Multer.File, questionnaireId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        // Verificar que el cuestionario existe
        this.questionnairesService.findOne(questionnaireId).then(() => {
          const questions: QuestionRow[] = [];
          const stream = Readable.from(file.buffer.toString());

          stream
            .pipe(csv())
            .on('data', (row: any) => {
              // Normalizar nombres de columnas (case insensitive)
              const normalizedRow: any = {};
              Object.keys(row).forEach(key => {
                normalizedRow[key.toLowerCase().trim()] = row[key];
              });

              if (normalizedRow.text && normalizedRow.type) {
                const question: QuestionRow = {
                  text: normalizedRow.text.trim(),
                  type: this.normalizeType(normalizedRow.type),
                  points: parseInt(normalizedRow.points) || 1,
                  order: parseInt(normalizedRow.order) || questions.length + 1,
                };

                // Procesar opciones si es multiple_choice
                if (question.type === QuestionType.MULTIPLE_CHOICE && normalizedRow.options) {
                  question.options = normalizedRow.options.split(',').map((opt: string) => opt.trim());
                }

                // Procesar respuesta correcta si existe
                if (normalizedRow.correctanswer) {
                  question.correctAnswer = normalizedRow.correctanswer.trim();
                }

                questions.push(question);
              }
            })
            .on('end', async () => {
              if (questions.length === 0) {
                reject(new BadRequestException('No se encontraron preguntas válidas en el archivo'));
                return;
              }

              try {
                // Crear preguntas en bulk
                const created = await this.questionsService.bulkCreate({
                  questionnaireId,
                  questions: questions.map(q => ({
                    text: q.text,
                    type: q.type,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    points: q.points,
                    order: q.order,
                  })),
                });

                resolve({
                  success: true,
                  message: `Se procesaron ${questions.length} preguntas`,
                  created: created.length,
                  questions: created,
                });
              } catch (error) {
                reject(new BadRequestException(`Error al crear preguntas: ${error.message}`));
              }
            })
            .on('error', (error) => {
              reject(new BadRequestException(`Error al procesar archivo CSV: ${error.message}`));
            });
        }).catch(reject);
      } catch (error) {
        reject(new BadRequestException(`Error al procesar archivo CSV: ${error.message}`));
      }
    });
  }

  private normalizeType(type: string): QuestionType {
    const normalized = type.toLowerCase().trim();
    
    if (normalized.includes('multiple') || normalized.includes('opcion') || normalized === 'mc') {
      return QuestionType.MULTIPLE_CHOICE;
    }
    if (normalized.includes('scale') || normalized.includes('escala') || normalized === 'sc') {
      return QuestionType.SCALE;
    }
    if (normalized.includes('text') || normalized.includes('texto') || normalized === 'tx') {
      return QuestionType.TEXT;
    }

    // Por defecto, asumir texto
    return QuestionType.TEXT;
  }

  getExpectedFormat(format: 'excel' | 'csv'): any {
    const columns = [
      { name: 'text', description: 'Texto de la pregunta (requerido)' },
      { name: 'type', description: 'Tipo: multiple_choice, scale o text (requerido)' },
      { name: 'options', description: 'Opciones separadas por coma (solo para multiple_choice)' },
      { name: 'correctAnswer', description: 'Respuesta correcta (opcional)' },
      { name: 'points', description: 'Puntos (default: 1)' },
      { name: 'order', description: 'Orden (default: secuencial)' },
    ];

    return {
      format,
      columns,
      example: {
        excel: 'Primera fila: encabezados, siguientes filas: datos',
        csv: 'Primera fila: encabezados, siguientes filas: datos separados por coma',
      },
    };
  }
}

