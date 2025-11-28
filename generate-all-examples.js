const ExcelJS = require('exceljs');

function createExcelFile(filename, preguntas, titulo) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Preguntas');

  // Definir las columnas
  worksheet.columns = [
    { header: 'text', key: 'text', width: 50 },
    { header: 'type', key: 'type', width: 20 },
    { header: 'minScale', key: 'minScale', width: 12 },
    { header: 'maxScale', key: 'maxScale', width: 12 },
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

  // Agregar las preguntas
  preguntas.forEach((pregunta) => {
    worksheet.addRow(pregunta);
  });

  // Aplicar bordes y estilos
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

  return workbook.xlsx.writeFile(filename);
}

// Preguntas para "Comunicación Efectiva" - TODAS tipo Likert
const comunicacionEfectiva = [
  {
    text: '¿Cómo te sientes al expresar tus ideas en un grupo de trabajo?',
    type: 'scale',
    minScale: 1,
    maxScale: 10,
    points: 5,
    order: 1,
  },
  {
    text: '¿Qué tan efectivo consideras que eres al escuchar activamente a tus compañeros?',
    type: 'scale',
    minScale: 1,
    maxScale: 10,
    points: 5,
    order: 2,
  },
  {
    text: '¿Qué tan cómodo te sientes al comunicar una idea compleja a un grupo?',
    type: 'scale',
    minScale: 1,
    maxScale: 10,
    points: 5,
    order: 3,
  },
  {
    text: '¿Prefieres la comunicación escrita o verbal en el trabajo en equipo?',
    type: 'scale',
    minScale: 1,
    maxScale: 5,
    points: 4,
    order: 4,
  },
  {
    text: '¿Qué tan importante consideras que es la comunicación no verbal (gestos, postura) en una presentación?',
    type: 'scale',
    minScale: 1,
    maxScale: 10,
    points: 5,
    order: 5,
  },
  {
    text: '¿Qué tan efectivo eres al manejar malentendidos en la comunicación con tus compañeros?',
    type: 'scale',
    minScale: 1,
    maxScale: 10,
    points: 6,
    order: 6,
  },
];

// Preguntas para "Resolución de Problemas"
const resolucionProblemas = [
  {
    text: '¿Qué tan rápido identificas la raíz de un problema?',
    type: 'scale',
    minScale: 1,
    maxScale: 10,
    points: 5,
    order: 1,
  },
  {
    text: '¿Qué tan efectivo eres al analizar un problema complejo antes de buscar soluciones?',
    type: 'scale',
    minScale: 1,
    maxScale: 10,
    points: 6,
    order: 2,
  },
  {
    text: '¿Qué tan hábil eres al desarrollar estrategias para resolver problemas?',
    type: 'scale',
    minScale: 1,
    maxScale: 10,
    points: 5,
    order: 3,
  },
  {
    text: '¿Qué tan cómodo te sientes resolviendo problemas en equipo vs solo?',
    type: 'scale',
    minScale: 1,
    maxScale: 5,
    points: 4,
    order: 4,
  },
  {
    text: '¿Qué tan creativo consideras que eres al buscar soluciones alternativas?',
    type: 'scale',
    minScale: 1,
    maxScale: 10,
    points: 5,
    order: 5,
  },
  {
    text: '¿Qué tan efectivo eres al manejar la frustración cuando una solución no funciona?',
    type: 'scale',
    minScale: 1,
    maxScale: 10,
    points: 6,
    order: 6,
  },
];

// Preguntas para "Uso de Herramientas Digitales"
const herramientasDigitales = [
  {
    text: '¿Qué tan cómodo te sientes usando herramientas de ofimática (Word, Excel, PowerPoint)?',
    type: 'scale',
    minScale: 1,
    maxScale: 10,
    points: 5,
    order: 1,
  },
  {
    text: '¿Qué tan frecuentemente usas diferentes tipos de herramientas digitales?',
    type: 'scale',
    minScale: 1,
    maxScale: 10,
    points: 5,
    order: 2,
  },
  {
    text: '¿Qué tan efectivo eres al utilizar herramientas digitales para mejorar tu productividad?',
    type: 'scale',
    minScale: 1,
    maxScale: 10,
    points: 5,
    order: 3,
  },
  {
    text: '¿Qué tan rápido aprendes a usar una nueva herramienta digital?',
    type: 'scale',
    minScale: 1,
    maxScale: 10,
    points: 5,
    order: 4,
  },
  {
    text: '¿Qué tan cómodo te sientes usando herramientas en la nube vs instaladas localmente?',
    type: 'scale',
    minScale: 1,
    maxScale: 5,
    points: 4,
    order: 5,
  },
  {
    text: '¿Qué tan actualizado te mantienes sobre nuevas herramientas digitales?',
    type: 'scale',
    minScale: 1,
    maxScale: 10,
    points: 5,
    order: 6,
  },
];

// Crear los tres archivos
Promise.all([
  createExcelFile(
    'preguntas-comunicacion-efectiva.xlsx',
    comunicacionEfectiva,
    'Comunicación Efectiva',
  ),
  createExcelFile(
    'preguntas-resolucion-problemas.xlsx',
    resolucionProblemas,
    'Resolución de Problemas',
  ),
  createExcelFile(
    'preguntas-herramientas-digitales.xlsx',
    herramientasDigitales,
    'Uso de Herramientas Digitales',
  ),
])
  .then(() => {
    console.log('✅ Archivos Excel creados exitosamente:');
    console.log(
      '   📄 preguntas-comunicacion-efectiva.xlsx (' +
        comunicacionEfectiva.length +
        ' preguntas)',
    );
    console.log(
      '   📄 preguntas-resolucion-problemas.xlsx (' +
        resolucionProblemas.length +
        ' preguntas)',
    );
    console.log(
      '   📄 preguntas-herramientas-digitales.xlsx (' +
        herramientasDigitales.length +
        ' preguntas)',
    );
  })
  .catch((error) => {
    console.error('❌ Error al crear los archivos:', error);
  });
