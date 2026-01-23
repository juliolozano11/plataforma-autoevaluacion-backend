# 📋 Plantilla para Cargar Preguntas

Este documento explica cómo usar la plantilla Excel para cargar múltiples preguntas en la plataforma.

## 📄 Archivo de Plantilla

**Ubicación:** `plantilla-preguntas.xlsx`

## 🚀 Generar la Plantilla

Si necesitas regenerar la plantilla, ejecuta:

```bash
npm run generate:template
```

Esto creará el archivo `plantilla-preguntas.xlsx` en la raíz del proyecto backend.

## 📊 Estructura del Archivo

La plantilla Excel contiene dos hojas:

### 1. Hoja "Preguntas"
Contiene los datos de las preguntas con las siguientes columnas:

| Columna | Descripción | Requerido | Valor por Defecto |
|---------|-------------|-----------|-------------------|
| **text** | Texto de la pregunta | ✅ Sí | - |
| **type** | Tipo de pregunta | ⚠️ Opcional | `scale` (siempre) |
| **minScale** | Valor mínimo de la escala | ⚠️ Opcional | `1` |
| **maxScale** | Valor máximo de la escala | ⚠️ Opcional | `10` |
| **points** | Puntos que vale la pregunta | ⚠️ Opcional | `1` |
| **order** | Orden de la pregunta | ⚠️ Opcional | Secuencial |

### 2. Hoja "Instrucciones"
Contiene una guía detallada sobre cómo usar la plantilla.

## ✏️ Cómo Usar la Plantilla

### Paso 1: Abrir la Plantilla
1. Abre el archivo `plantilla-preguntas.xlsx` con Excel, Google Sheets, o cualquier editor compatible.

### Paso 2: Agregar tus Preguntas
1. **Elimina las filas de ejemplo** (opcional, pero recomendado)
2. **Agrega tus preguntas** en las filas siguientes
3. **Completa las columnas:**
   - **text**: Escribe el texto completo de la pregunta
   - **type**: Deja `scale` o déjalo vacío (siempre será `scale`)
   - **minScale**: Valor mínimo (debe ser `1`)
   - **maxScale**: Valor máximo (debe estar entre `5` y `10`)
   - **points**: Puntos que vale la pregunta (ej: `1`, `2`, `3`)
   - **order**: Orden de aparición (ej: `1`, `2`, `3`...)

### Paso 3: Guardar el Archivo
1. Guarda el archivo con un nombre descriptivo (ej: `preguntas-cuestionario-1.xlsx`)
2. Asegúrate de que el formato sea `.xlsx` o `.xls`

### Paso 4: Cargar en la Plataforma
1. Ve a la sección **"Cargar Preguntas"** en el panel de administración
2. Selecciona el cuestionario al que quieres agregar las preguntas
3. Selecciona el formato: **Excel (.xlsx, .xls)**
4. Haz clic en **"Archivo"** y selecciona tu archivo
5. Haz clic en **"Cargar Preguntas"**

## 📝 Ejemplos de Preguntas

### Ejemplo 1: Pregunta Simple
```
text: ¿Qué tan satisfecho estás con la calidad de la enseñanza recibida?
type: scale
minScale: 1
maxScale: 5
points: 1
order: 1
```

### Ejemplo 2: Pregunta con Escala Mayor
```
text: ¿Con qué frecuencia consideras que los contenidos del curso son relevantes?
type: scale
minScale: 1
maxScale: 7
points: 1
order: 2
```

### Ejemplo 3: Pregunta con Más Puntos
```
text: ¿En qué medida estás de acuerdo con que los métodos de evaluación son justos?
type: scale
minScale: 1
maxScale: 10
points: 2
order: 3
```

## ⚠️ Restricciones y Validaciones

### Restricciones de Escala
- **minScale**: Siempre debe ser `1` (no se puede cambiar)
- **maxScale**: Debe estar entre `5` y `10`

### Validaciones
- El campo `text` es **obligatorio** - no puede estar vacío
- Todas las preguntas son tipo `scale` (Likert) - no se pueden crear otros tipos
- Los valores numéricos deben ser enteros positivos

### Valores por Defecto
Si no especificas un valor, se usarán estos por defecto:
- `type`: `scale`
- `minScale`: `1`
- `maxScale`: `10`
- `points`: `1`
- `order`: Se asignará automáticamente según la posición en el archivo

## 🔍 Consejos

1. **Textos claros**: Escribe preguntas claras y concisas
2. **Orden lógico**: Organiza las preguntas en un orden lógico usando la columna `order`
3. **Escalas consistentes**: Usa escalas similares para preguntas relacionadas
4. **Revisar antes de cargar**: Verifica que todas las preguntas tengan texto y valores válidos
5. **Backup**: Guarda una copia del archivo antes de cargarlo

## ❓ Preguntas Frecuentes

### ¿Puedo usar CSV en lugar de Excel?
Sí, la plataforma también acepta archivos CSV con el mismo formato.

### ¿Qué pasa si dejo una columna vacía?
Se usarán los valores por defecto mencionados arriba.

### ¿Puedo modificar preguntas después de cargarlas?
Sí, puedes editar las preguntas desde la sección "Preguntas" en el panel de administración.

### ¿Puedo cargar preguntas a múltiples cuestionarios?
No, cada archivo se carga a un solo cuestionario. Si necesitas cargar a varios, repite el proceso para cada uno.

## 🐛 Solución de Problemas

### Error: "No se encontraron preguntas válidas"
- Verifica que la primera fila contenga los encabezados correctos
- Asegúrate de que al menos una pregunta tenga texto en la columna `text`

### Error: "El archivo Excel no contiene hojas"
- Asegúrate de que el archivo tenga al menos una hoja
- Verifica que el archivo no esté corrupto

### Error: "Valores inválidos en maxScale"
- Verifica que `maxScale` esté entre 5 y 10
- Asegúrate de que sea un número entero

## 📞 Soporte

Si tienes problemas al cargar las preguntas, verifica:
1. El formato del archivo (debe ser `.xlsx` o `.xls`)
2. Los encabezados de las columnas (deben coincidir exactamente)
3. Los valores numéricos (deben ser enteros válidos)
4. Que el cuestionario seleccionado exista
