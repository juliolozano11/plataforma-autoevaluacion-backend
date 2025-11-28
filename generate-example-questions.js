const ExcelJS = require('exceljs');

// Crear un nuevo workbook
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Preguntas');

// Definir las columnas
worksheet.columns = [
  { header: 'text', key: 'text', width: 50 },
  { header: 'type', key: 'type', width: 20 },
  { header: 'options', key: 'options', width: 40 },
  { header: 'correctAnswer', key: 'correctAnswer', width: 20 },
  { header: 'points', key: 'points', width: 10 },
  { header: 'order', key: 'order', width: 10 },
];

// Estilo para los encabezados
worksheet.getRow(1).font = { bold: true };
worksheet.getRow(1).fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF4472C4' },
};
worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

// Datos de ejemplo para "Comunicación Efectiva"
const preguntas = [
  {
    text: '¿Cómo te sientes al expresar tus ideas en un grupo de trabajo?',
    type: 'multiple_choice',
    options: 'Muy cómodo,Cómodo,Neutral,Incómodo,Muy incómodo',
    correctAnswer: 'Cómodo',
    points: 5,
    order: 1,
  },
  {
    text: '¿Qué tan efectivo consideras que eres al escuchar activamente a tus compañeros?',
    type: 'scale',
    options: '',
    correctAnswer: '7',
    points: 5,
    order: 2,
  },
  {
    text: 'Describe una situación donde tuviste que comunicar una idea compleja a un grupo. ¿Cómo lo manejaste?',
    type: 'text',
    options: '',
    correctAnswer: '',
    points: 10,
    order: 3,
  },
  {
    text: '¿Prefieres la comunicación escrita o verbal en el trabajo en equipo?',
    type: 'multiple_choice',
    options: 'Solo escrita,Solo verbal,Ambas por igual,Depende de la situación',
    correctAnswer: 'Ambas por igual',
    points: 4,
    order: 4,
  },
  {
    text: '¿Qué tan importante consideras que es la comunicación no verbal (gestos, postura) en una presentación?',
    type: 'scale',
    options: '',
    correctAnswer: '8',
    points: 5,
    order: 5,
  },
  {
    text: '¿Cómo manejas los malentendidos en la comunicación con tus compañeros?',
    type: 'multiple_choice',
    options:
      'Los evito,Los aclaro inmediatamente,Espero a que se resuelvan solos,Los discuto en privado',
    correctAnswer: 'Los aclaro inmediatamente',
    points: 6,
    order: 6,
  },
  {
    text: '¿Qué tan frecuentemente pides retroalimentación sobre tu forma de comunicarte?',
    type: 'scale',
    options: '',
    correctAnswer: '6',
    points: 4,
    order: 7,
  },
  {
    text: 'Describe cómo mejorarías tu comunicación en situaciones de conflicto.',
    type: 'text',
    options: '',
    correctAnswer: '',
    points: 8,
    order: 8,
  },
];

// Agregar las preguntas
preguntas.forEach((pregunta) => {
  worksheet.addRow(pregunta);
});

// Aplicar bordes a todas las celdas
worksheet.eachRow((row, rowNumber) => {
  row.eachCell((cell) => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
    if (rowNumber === 1) {
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    } else {
      cell.alignment = { vertical: 'top', wrapText: true };
    }
  });
});

// Guardar el archivo
workbook.xlsx
  .writeFile('preguntas-comunicacion-efectiva.xlsx')
  .then(() => {
    console.log(
      '✅ Archivo Excel creado exitosamente: preguntas-comunicacion-efectiva.xlsx',
    );
    console.log('📊 Total de preguntas: ' + preguntas.length);
  })
  .catch((error) => {
    console.error('❌ Error al crear el archivo:', error);
  });
