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
  minScale?: number;
  maxScale?: number;
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

        // Validar y mapear datos (type ya no es requerido, todas son scale)
        if (rowData.text) {
          const question: QuestionRow = {
            text: rowData.text.trim(),
            type: this.normalizeType(rowData.type),
            points: parseInt(rowData.points) || 1,
            order: parseInt(rowData.order) || rowIndex,
          };

          // Procesar configuración de escala (TODAS las preguntas son tipo scale)
          if (rowData.minscale) {
            question.minScale = parseInt(rowData.minscale) || 1;
          } else {
            question.minScale = 1; // Valor por defecto
          }
          
          if (rowData.maxscale) {
            question.maxScale = parseInt(rowData.maxscale) || 10;
          } else {
            question.maxScale = 10; // Valor por defecto
          }
          
          // Asegurar que todas las preguntas sean tipo scale
          question.type = QuestionType.SCALE;

          questions.push(question);
        }
        rowNumber++;
      });

      if (questions.length === 0) {
        throw new BadRequestException('No se encontraron preguntas válidas en el archivo');
      }

        // Crear preguntas en bulk - TODAS son tipo scale
        const created = await this.questionsService.bulkCreate({
          questionnaireId,
          questions: questions.map(q => ({
            text: q.text,
            type: QuestionType.SCALE, // Todas son tipo scale
            minScale: q.minScale ?? 1,
            maxScale: q.maxScale ?? 10,
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

              if (normalizedRow.text) {
                const question: QuestionRow = {
                  text: normalizedRow.text.trim(),
                  type: QuestionType.SCALE, // Todas son tipo scale
                  points: parseInt(normalizedRow.points) || 1,
                  order: parseInt(normalizedRow.order) || questions.length + 1,
                };

                // Procesar configuración de escala
                if (normalizedRow.minscale) {
                  question.minScale = parseInt(normalizedRow.minscale) || 1;
                } else {
                  question.minScale = 1; // Valor por defecto
                }
                
                if (normalizedRow.maxscale) {
                  question.maxScale = parseInt(normalizedRow.maxscale) || 10;
                } else {
                  question.maxScale = 10; // Valor por defecto
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
                // Crear preguntas en bulk - TODAS son tipo scale
                const created = await this.questionsService.bulkCreate({
                  questionnaireId,
                  questions: questions.map(q => ({
                    text: q.text,
                    type: QuestionType.SCALE, // Todas son tipo scale
                    minScale: q.minScale ?? 1,
                    maxScale: q.maxScale ?? 10,
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
    // TODAS las preguntas son tipo scale (Likert)
    return QuestionType.SCALE;
  }

  getExpectedFormat(format: 'excel' | 'csv'): any {
    const columns = [
      { name: 'text', description: 'Texto de la pregunta (requerido)' },
      { name: 'type', description: 'Tipo: siempre debe ser "scale" (Likert)' },
      { name: 'minScale', description: 'Valor mínimo de la escala (default: 1)' },
      { name: 'maxScale', description: 'Valor máximo de la escala (default: 10)' },
      { name: 'points', description: 'Puntos que vale la pregunta (default: 1)' },
      { name: 'order', description: 'Orden de la pregunta (default: secuencial)' },
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

