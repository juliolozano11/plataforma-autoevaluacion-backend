import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error(
      '❌ MONGODB_URI no está configurada en el archivo .env. ' +
      'Por favor, crea un archivo .env en la carpeta back/ con la variable MONGODB_URI. ' +
      'Puedes usar env.example como referencia.',
    );
  }
  
  return {
    uri,
    // Nota: useNewUrlParser y useUnifiedTopology están deprecados desde MongoDB Driver 4.0.0
    // Ya no son necesarios y se eliminan para evitar advertencias
    options: {},
  };
});

