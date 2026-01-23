import { BadRequestException, Injectable } from '@nestjs/common';
import csv from 'csv-parser';
import * as ExcelJS from 'exceljs';
import { Readable } from 'stream';
import { QuestionnairesService } from '../questionnaires/questionnaires.service';
import { QuestionsService } from '../questions/questions.service';
import { QuestionType } from '../schemas/question.schema';

interface QuestionRow {
  text: string;
  type: QuestionType;
  minScale?: number;
  maxScale?: number;
  responseType?: 'satisfaction' | 'frequency' | 'agreement' | 'numeric';
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
          
          // Procesar tipo de respuesta (responseType)
          const validResponseTypes = ['satisfaction', 'frequency', 'agreement', 'numeric'];
          if (rowData.responsetype) {
            const normalizedResponseType = rowData.responsetype.toLowerCase().trim();
            if (validResponseTypes.includes(normalizedResponseType)) {
              question.responseType = normalizedResponseType as 'satisfaction' | 'frequency' | 'agreement' | 'numeric';
            } else {
              question.responseType = 'satisfaction'; // Valor por defecto si es inválido
            }
          } else {
            question.responseType = 'satisfaction'; // Valor por defecto
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
            responseType: q.responseType ?? 'satisfaction',
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

                // Procesar tipo de respuesta (responseType)
                const validResponseTypes = ['satisfaction', 'frequency', 'agreement', 'numeric'];
                if (normalizedRow.responsetype) {
                  const normalizedResponseType = normalizedRow.responsetype.toLowerCase().trim();
                  if (validResponseTypes.includes(normalizedResponseType)) {
                    question.responseType = normalizedResponseType as 'satisfaction' | 'frequency' | 'agreement' | 'numeric';
                  } else {
                    question.responseType = 'satisfaction'; // Valor por defecto si es inválido
                  }
                } else {
                  question.responseType = 'satisfaction'; // Valor por defecto
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
                    responseType: q.responseType ?? 'satisfaction',
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
      { name: 'responseType', description: 'Tipo de respuesta: "satisfaction", "frequency", "agreement" o "numeric" (default: "satisfaction")' },
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

  async generateTemplate(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Preguntas');

    // Definir columnas
    worksheet.columns = [
      { header: 'text', key: 'text', width: 60 },
      { header: 'type', key: 'type', width: 15 },
      { header: 'minScale', key: 'minScale', width: 12 },
      { header: 'maxScale', key: 'maxScale', width: 12 },
      { header: 'responseType', key: 'responseType', width: 18 },
      { header: 'points', key: 'points', width: 10 },
      { header: 'order', key: 'order', width: 10 },
    ];

    // Estilo para los encabezados
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4A90E2' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    // Datos de ejemplo
    const exampleQuestions = [
      {
        text: '¿Qué tan satisfecho estás con la calidad de la enseñanza recibida?',
        type: 'scale',
        minScale: 1,
        maxScale: 5,
        responseType: 'satisfaction',
        points: 1,
        order: 1,
      },
      {
        text: '¿Con qué frecuencia consideras que los contenidos del curso son relevantes para tu formación profesional?',
        type: 'scale',
        minScale: 1,
        maxScale: 7,
        responseType: 'frequency',
        points: 1,
        order: 2,
      },
      {
        text: '¿En qué medida estás de acuerdo con que los métodos de evaluación son justos?',
        type: 'scale',
        minScale: 1,
        maxScale: 10,
        responseType: 'agreement',
        points: 2,
        order: 3,
      },
      {
        text: '¿Qué tan efectivo consideras que es el uso de recursos tecnológicos en las clases?',
        type: 'scale',
        minScale: 1,
        maxScale: 5,
        responseType: 'satisfaction',
        points: 1,
        order: 4,
      },
      {
        text: '¿Con qué frecuencia recibes retroalimentación útil sobre tu desempeño académico?',
        type: 'scale',
        minScale: 1,
        maxScale: 6,
        responseType: 'frequency',
        points: 1,
        order: 5,
      },
    ];

    // Agregar datos de ejemplo
    exampleQuestions.forEach((question) => {
      const row = worksheet.addRow(question);
      row.alignment = { vertical: 'middle', wrapText: true };
    });

    // Aplicar bordes a todas las celdas con datos
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        if (rowNumber > 1) {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
      });
    });

    // Agregar una hoja de instrucciones
    const instructionsSheet = workbook.addWorksheet('Instrucciones');
    
    instructionsSheet.columns = [
      { header: 'Instrucciones', key: 'instructions', width: 100 },
    ];

    const instructions = [
      'INSTRUCCIONES PARA CARGAR PREGUNTAS',
      '',
      '1. FORMATO DEL ARCHIVO:',
      '   - Primera fila: Encabezados de columnas (NO modificar)',
      '   - Siguientes filas: Datos de las preguntas',
      '',
      '2. COLUMNAS REQUERIDAS:',
      '   - text: Texto de la pregunta (OBLIGATORIO)',
      '   - type: Tipo de pregunta (siempre debe ser "scale")',
      '   - minScale: Valor mínimo de la escala (por defecto: 1)',
      '   - maxScale: Valor máximo de la escala (por defecto: 10)',
      '   - responseType: Tipo de respuesta (por defecto: "satisfaction")',
      '   - points: Puntos que vale la pregunta (por defecto: 1)',
      '   - order: Orden de la pregunta (por defecto: secuencial)',
      '',
      '3. TIPOS DE RESPUESTA (responseType):',
      '   - satisfaction: Etiquetas de satisfacción (Nada satisfecho, Poco satisfecho, etc.)',
      '   - frequency: Etiquetas de frecuencia (Nunca, Pocas veces, Siempre, etc.)',
      '   - agreement: Etiquetas de acuerdo (Totalmente en desacuerdo, De acuerdo, etc.)',
      '   - numeric: Solo números sin etiquetas',
      '',
      '4. VALORES POR DEFECTO:',
      '   - Si no especificas minScale, se usará 1',
      '   - Si no especificas maxScale, se usará 10',
      '   - Si no especificas responseType, se usará "satisfaction"',
      '   - Si no especificas points, se usará 1',
      '   - Si no especificas order, se asignará automáticamente',
      '',
      '5. RESTRICCIONES:',
      '   - minScale: Siempre debe ser 1',
      '   - maxScale: Debe estar entre 5 y 10',
      '   - type: Todas las preguntas son tipo "scale" (Likert)',
      '   - responseType: Debe ser uno de: "satisfaction", "frequency", "agreement" o "numeric"',
      '',
      '6. EJEMPLOS DE ESCALAS:',
      '   - Escala 1-5 con satisfaction: Para preguntas de satisfacción',
      '   - Escala 1-7 con frequency: Para preguntas de frecuencia',
      '   - Escala 1-10 con agreement: Para preguntas de acuerdo',
      '',
      '7. NOTAS IMPORTANTES:',
      '   - Puedes eliminar las filas de ejemplo y agregar tus propias preguntas',
      '   - Asegúrate de que el texto de la pregunta sea claro y conciso',
      '   - El tipo de respuesta (responseType) determina las etiquetas que verán los estudiantes',
      '   - El orden de las preguntas se puede ajustar modificando la columna "order"',
      '',
      '8. ANTES DE CARGAR:',
      '   - Verifica que todas las preguntas tengan texto',
      '   - Asegúrate de que los valores numéricos sean correctos',
      '   - Guarda el archivo antes de subirlo a la plataforma',
    ];

    instructions.forEach((instruction, index) => {
      const row = instructionsSheet.addRow([instruction]);
      if (index === 0) {
        row.getCell(1).font = { bold: true, size: 14, color: { argb: 'FF4A90E2' } };
        row.height = 30;
      } else if (instruction.startsWith('   -') || instruction.startsWith('   ')) {
        row.getCell(1).font = { size: 10 };
      } else if (instruction.trim() !== '') {
        row.getCell(1).font = { bold: true, size: 11 };
        row.height = 20;
      }
      row.getCell(1).alignment = { vertical: 'middle', wrapText: true };
    });

    // Generar buffer del archivo
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}

