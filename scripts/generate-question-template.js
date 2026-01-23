const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function generateTemplate() {
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
    fgColor: { argb: 'FF4A90E2' }, // Azul
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
        // Filas de datos
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
      // Título
      row.getCell(1).font = { bold: true, size: 14, color: { argb: 'FF4A90E2' } };
      row.height = 30;
    } else if (instruction.startsWith('   -') || instruction.startsWith('   ')) {
      // Sub-items
      row.getCell(1).font = { size: 10 };
    } else if (instruction.trim() !== '') {
      // Secciones
      row.getCell(1).font = { bold: true, size: 11 };
      row.height = 20;
    }
    row.getCell(1).alignment = { vertical: 'middle', wrapText: true };
  });

  // Guardar el archivo
  const outputPath = path.join(__dirname, '..', 'plantilla-preguntas.xlsx');
  await workbook.xlsx.writeFile(outputPath);

  console.log('✅ Plantilla Excel generada exitosamente!');
  console.log(`📄 Archivo guardado en: ${outputPath}`);
  console.log('\n📋 El archivo contiene:');
  console.log('   - Hoja "Preguntas": Con 5 ejemplos de preguntas');
  console.log('   - Hoja "Instrucciones": Con guía detallada de uso');
  console.log('\n💡 Puedes eliminar las filas de ejemplo y agregar tus propias preguntas.');
}

generateTemplate().catch((error) => {
  console.error('❌ Error al generar la plantilla:', error);
  process.exit(1);
});
