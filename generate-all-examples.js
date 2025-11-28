const ExcelJS = require('exceljs');

function createExcelFile(filename, preguntas, titulo) {
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

// Preguntas para "Comunicación Efectiva"
const comunicacionEfectiva = [
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
    options: 'Los evito,Los aclaro inmediatamente,Espero a que se resuelvan solos,Los discuto en privado',
    correctAnswer: 'Los aclaro inmediatamente',
    points: 6,
    order: 6,
  },
];

// Preguntas para "Resolución de Problemas"
const resolucionProblemas = [
  {
    text: '¿Qué tan rápido identificas la raíz de un problema?',
    type: 'scale',
    options: '',
    correctAnswer: '7',
    points: 5,
    order: 1,
  },
  {
    text: 'Cuando enfrentas un problema complejo, ¿cuál es tu primer paso?',
    type: 'multiple_choice',
    options: 'Analizar el problema,Consultar con otros,Buscar soluciones rápidas,Evitar el problema',
    correctAnswer: 'Analizar el problema',
    points: 6,
    order: 2,
  },
  {
    text: 'Describe un problema que hayas resuelto exitosamente. ¿Qué estrategia usaste?',
    type: 'text',
    options: '',
    correctAnswer: '',
    points: 10,
    order: 3,
  },
  {
    text: '¿Prefieres resolver problemas solo o en equipo?',
    type: 'multiple_choice',
    options: 'Solo,En equipo,Depende del problema,Ambas opciones',
    correctAnswer: 'Depende del problema',
    points: 4,
    order: 4,
  },
  {
    text: '¿Qué tan creativo consideras que eres al buscar soluciones alternativas?',
    type: 'scale',
    options: '',
    correctAnswer: '6',
    points: 5,
    order: 5,
  },
  {
    text: '¿Cómo manejas la frustración cuando una solución no funciona?',
    type: 'multiple_choice',
    options: 'Me rindo,Intento otra solución,Analizo qué salió mal,Pido ayuda',
    correctAnswer: 'Analizo qué salió mal',
    points: 6,
    order: 6,
  },
];

// Preguntas para "Uso de Herramientas Digitales"
const herramientasDigitales = [
  {
    text: '¿Qué tan cómodo te sientes usando herramientas de ofimática (Word, Excel, PowerPoint)?',
    type: 'scale',
    options: '',
    correctAnswer: '8',
    points: 5,
    order: 1,
  },
  {
    text: '¿Qué tipo de herramientas digitales usas con más frecuencia?',
    type: 'multiple_choice',
    options: 'Ofimática,Programación,Comunicación,Multimedia,Todas las anteriores',
    correctAnswer: 'Todas las anteriores',
    points: 5,
    order: 2,
  },
  {
    text: 'Describe cómo has utilizado herramientas digitales para mejorar tu productividad en un proyecto.',
    type: 'text',
    options: '',
    correctAnswer: '',
    points: 10,
    order: 3,
  },
  {
    text: '¿Qué tan rápido aprendes a usar una nueva herramienta digital?',
    type: 'scale',
    options: '',
    correctAnswer: '7',
    points: 5,
    order: 4,
  },
  {
    text: '¿Prefieres herramientas en la nube o instaladas localmente?',
    type: 'multiple_choice',
    options: 'Solo nube,Solo locales,Ambas,No tengo preferencia',
    correctAnswer: 'Ambas',
    points: 4,
    order: 5,
  },
  {
    text: '¿Cómo te mantienes actualizado sobre nuevas herramientas digitales?',
    type: 'multiple_choice',
    options: 'Cursos en línea,Foros y comunidades,Prueba y error,No me actualizo',
    correctAnswer: 'Cursos en línea',
    points: 5,
    order: 6,
  },
];

// Crear los tres archivos
Promise.all([
  createExcelFile('preguntas-comunicacion-efectiva.xlsx', comunicacionEfectiva, 'Comunicación Efectiva'),
  createExcelFile('preguntas-resolucion-problemas.xlsx', resolucionProblemas, 'Resolución de Problemas'),
  createExcelFile('preguntas-herramientas-digitales.xlsx', herramientasDigitales, 'Uso de Herramientas Digitales'),
])
  .then(() => {
    console.log('✅ Archivos Excel creados exitosamente:');
    console.log('   📄 preguntas-comunicacion-efectiva.xlsx (' + comunicacionEfectiva.length + ' preguntas)');
    console.log('   📄 preguntas-resolucion-problemas.xlsx (' + resolucionProblemas.length + ' preguntas)');
    console.log('   📄 preguntas-herramientas-digitales.xlsx (' + herramientasDigitales.length + ' preguntas)');
  })
  .catch((error) => {
    console.error('❌ Error al crear los archivos:', error);
  });

