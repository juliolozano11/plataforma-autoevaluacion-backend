// Script para eliminar el índice antiguo de evaluaciones y crear el nuevo
// Ejecutar con: node scripts/fix-evaluation-index.js

const { MongoClient } = require('mongodb');
require('dotenv').config();

async function fixIndex() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI no está configurada');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');

    const db = client.db();
    const collection = db.collection('evaluations');

    // Listar índices actuales
    const indexes = await collection.indexes();
    console.log('\n📋 Índices actuales:');
    indexes.forEach((idx) => {
      console.log(`  - ${idx.name}:`, idx.key);
    });

    // Eliminar el índice antiguo si existe
    try {
      await collection.dropIndex('userId_1_sectionId_1');
      console.log('\n✅ Índice antiguo userId_1_sectionId_1 eliminado');
    } catch (error) {
      if (error.code === 27) {
        console.log('\n⚠️  El índice userId_1_sectionId_1 no existe (ya fue eliminado)');
      } else {
        throw error;
      }
    }

    // Crear el nuevo índice sparse
    try {
      await collection.createIndex(
        { userId: 1, sectionId: 1, questionnaireId: 1 },
        { unique: true, sparse: true, name: 'userId_1_sectionId_1_questionnaireId_1' }
      );
      console.log('✅ Nuevo índice userId_1_sectionId_1_questionnaireId_1 creado (sparse)');
    } catch (error) {
      console.error('❌ Error al crear el nuevo índice:', error.message);
    }

    // Listar índices finales
    const finalIndexes = await collection.indexes();
    console.log('\n📋 Índices finales:');
    finalIndexes.forEach((idx) => {
      console.log(`  - ${idx.name}:`, idx.key);
    });

    console.log('\n✅ Migración completada');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

fixIndex();

