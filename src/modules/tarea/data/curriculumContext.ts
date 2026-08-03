import { mathTopics } from '@/modules/math/data/mathTopics'

export type HomeworkSubject =
  | 'matematicas'
  | 'ciencias'
  | 'ingles'
  | 'historia'
  | 'lenguaje'
  | 'tecnologia'
  | 'robotica'
  | 'otra'

export const SUBJECTS: Array<{ value: HomeworkSubject; label: string }> = [
  { value: 'matematicas', label: 'Matemáticas' },
  { value: 'ciencias', label: 'Ciencias naturales' },
  { value: 'ingles', label: 'Inglés' },
  { value: 'historia', label: 'Historia y geografía' },
  { value: 'lenguaje', label: 'Lenguaje' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'robotica', label: 'Robótica' },
  { value: 'otra', label: 'Otra materia' },
]

export const GRADES = [
  { value: '5-basico', label: '5° Básico' },
  { value: '6-basico', label: '6° Básico' },
  { value: '7-basico', label: '7° Básico' },
  { value: '8-basico', label: '8° Básico' },
  { value: '1-medio', label: '1° Medio' },
] as const

const FOCUS: Record<Exclude<HomeworkSubject, 'otra'>, string> = {
  matematicas:
    'razonamiento, resolución de problemas, números, álgebra, geometría, medición, datos y probabilidades',
  ciencias:
    'indagación científica, vida y salud, ciencias físicas y químicas, Tierra y universo',
  ingles:
    'comprensión auditiva y lectora, expresión oral y escrita, vocabulario en contexto',
  historia:
    'pensamiento histórico y geográfico, ciudadanía, análisis de fuentes y procesos sociales',
  lenguaje:
    'lectura crítica, escritura, comunicación oral, investigación y comprensión de textos',
  tecnologia:
    'diseño de soluciones, pensamiento tecnológico, seguridad, impacto social y trabajo con proyectos',
  robotica:
    'pensamiento computacional, sensores, mecanismos, programación, prototipado y resolución de problemas',
}

// Texto oficial (o muy cercano al oficial) de cada Objetivo de Aprendizaje de
// Matemática 5° básico, según las Bases Curriculares vigentes del Mineduc
// (curriculumnacional.cl). Se usa para que el tutor explique con contenido
// real del programa en vez de generalidades, cuando el eje coincide con lo
// que el estudiante pide. Las claves son los mismos id de lesson en
// src/modules/math/data/mathTopics.ts — no dupliques los títulos, solo el
// texto del objetivo.
const MATH_OA_TEXT: Record<string, string> = {
  oa1: 'Representar y describir números naturales de hasta más de 6 dígitos y menores que 1.000 millones, identificando el valor posicional, componiendo y descomponiendo, comparando y ordenando.',
  oa2: 'Aplicar estrategias de cálculo mental para la multiplicación: anexar ceros al multiplicar por 10, doblar y dividir por 2, y usar las propiedades conmutativa, asociativa y distributiva.',
  oa3: 'Comprender la multiplicación de números de dos dígitos por dos dígitos: estimar productos, usar cálculo mental y resolver problemas aplicando el algoritmo.',
  oa4: 'Comprender la división con dividendos de tres dígitos y divisores de un dígito, interpretando el resto y resolviendo problemas.',
  oa5: 'Realizar cálculos con las cuatro operaciones aplicando las reglas de los paréntesis y la prevalencia de la multiplicación/división sobre la suma/resta.',
  oa6: 'Resolver problemas con las cuatro operaciones combinadas, incluyendo situaciones con dinero, usando calculadora en ámbitos numéricos superiores a 10.000.',
  oa7: 'Comprender las fracciones propias: representarlas, crear fracciones equivalentes (amplificar/simplificar) y comparar fracciones con igual o distinto denominador.',
  oa8: 'Comprender las fracciones impropias (denominadores 2,3,4,5,6,8,10,12) y los números mixtos: representarlas, encontrar equivalencias y ubicarlas en la recta numérica.',
  oa9: 'Sumar y restar fracciones propias con denominadores menores o iguales a 12, de forma pictórica y simbólica, amplificando o simplificando.',
  oa10: 'Determinar el decimal que corresponde a fracciones con denominador 2, 4, 5 y 10.',
  oa11: 'Comparar y ordenar números decimales hasta la milésima.',
  oa12: 'Sumar y restar decimales, empleando el valor posicional hasta la milésima.',
  oa13: 'Resolver problemas aplicando sumas y restas de fracciones propias o decimales hasta la milésima.',
  oa14: 'Descubrir la regla que explica una sucesión de números o figuras y usarla para hacer predicciones.',
  oa15: 'Resolver problemas usando ecuaciones e inecuaciones de un paso que involucren sumas y restas, de forma pictórica y simbólica.',
  oa16: 'Identificar y dibujar puntos en el primer cuadrante del plano cartesiano, dadas sus coordenadas en números naturales.',
  oa17: 'Describir y dar ejemplos de aristas y caras de figuras 3D, y lados de figuras 2D, que son paralelos, se intersectan o son perpendiculares.',
  oa18: 'Comprender el concepto de congruencia usando traslación, reflexión y rotación en cuadrículas.',
  oa19: 'Medir longitudes con unidades estandarizadas (m, cm, mm) resolviendo problemas.',
  oa20: 'Transformar unidades de longitud: km a m, m a cm, cm a mm y viceversa.',
  oa21: 'Diseñar y construir rectángulos dado el perímetro, el área o ambos, y sacar conclusiones.',
  oa22: 'Calcular áreas de triángulos, paralelogramos y trapecios, y estimar áreas de figuras irregulares (conteo de cuadrícula, comparación, traslación).',
  oa23: 'Calcular el promedio (media aritmética) de un conjunto de datos e interpretarlo en su contexto.',
  oa24: 'Describir qué tan posible es que ocurra un evento a partir de un experimento aleatorio, usando los términos seguro, posible, poco posible e imposible.',
  oa25: 'Comparar la probabilidad de distintos eventos entre sí, sin necesidad de calcularla.',
  oa26: 'Leer, interpretar y completar tablas, gráficos de barra simple y gráficos de línea, y comunicar conclusiones a partir de ellos.',
  oa27: 'Usar diagramas de tallo y hojas para representar datos que vienen de una muestra tomada al azar.',
}

// Palabras clave con las que un niño podría describir cada eje de Matemática
// 5° básico, para detectar de qué tema quiere ayuda aunque no use el nombre
// técnico del eje (ej: "estadística" en vez de "datos y probabilidades").
const MATH_TOPIC_KEYWORDS: Record<string, string[]> = {
  numeros: ['numero grande', 'numeros grandes', 'valor posicional', 'millones'],
  multiplicacion: ['multiplicar', 'multiplicacion', 'tabla de multiplicar', 'producto'],
  division: ['dividir', 'division', 'divisiones', 'resto de la division'],
  fracciones: ['fraccion', 'fracciones', 'mitad', 'tercio', 'cuarto de'],
  decimales: ['decimal', 'decimales', 'numero con coma', 'numeros con coma'],
  algebra: ['ecuacion', 'ecuaciones', 'patron', 'patrones', 'sucesion', 'algebra', 'incognita'],
  geometria: ['geometria', 'figuras geometricas', 'plano cartesiano', 'simetria', 'traslacion', 'figuras 2d', 'figuras 3d'],
  medicion: ['medir', 'medicion', 'area', 'perimetro', 'longitud', 'centimetros', 'metros'],
  datos: [
    'estadistica',
    'datos y probabilidad',
    'probabilidad',
    'promedio',
    'grafico',
    'graficos',
    'tabla de datos',
    'encuesta',
    'moda',
    'mediana',
    'tallo y hojas',
  ],
}

const DIACRITICS_RANGE = new RegExp('[\\u0300-\\u036f]', 'g')

function normalize(text: string) {
  return text.toLowerCase().normalize('NFD').replace(DIACRITICS_RANGE, '')
}

/** Busca en un texto libre (lo que el niño escribió) a qué eje de Matemática
 * 5° básico corresponde, usando palabras clave. Retorna el topic completo de
 * mathTopics.ts (con sus lessons/OA) o undefined si no encuentra coincidencia
 * clara — en ese caso se usa el contexto genérico de siempre. */
function detectMathTopic(text: string) {
  const normalized = normalize(text)
  for (const topic of mathTopics) {
    const keywords = MATH_TOPIC_KEYWORDS[topic.id]
    if (keywords?.some((keyword) => normalized.includes(normalize(keyword)))) {
      return topic
    }
  }
  return undefined
}

function mathTopicContext(topicId: string, gradeLabel: string) {
  const topic = mathTopics.find((item) => item.id === topicId)
  if (!topic) return undefined
  const objectives = topic.lessons
    .map((lesson) => `${lesson.title}: ${MATH_OA_TEXT[lesson.id] ?? ''}`.trim())
    .filter((line) => !line.endsWith(':'))
    .join(' | ')
  return `Referencia curricular chilena (Mineduc, Bases Curriculares vigentes) para ${gradeLabel}, Matemática — eje "${topic.title}" (${topic.description}). Objetivos de aprendizaje oficiales de este eje: ${objectives}. Explica con contenido real de estos objetivos y construye un ejemplo o ejercicio concreto y simple, acorde al curso. No inventes contenido fuera de este eje salvo que el estudiante pregunte otra cosa.`
}

/**
 * @param description Texto libre que escribió el estudiante (lo que pidió o
 * el material de la tarea). Si coincide con un eje conocido de Matemática
 * 5° básico, se agrega el contenido oficial de ese eje al contexto en vez
 * del resumen genérico por materia. Opcional: si no se pasa, o no hay
 * coincidencia, se usa siempre el contexto genérico (comportamiento previo).
 */
export function curriculumContext(subject: HomeworkSubject, grade: string, description?: string) {
  const subjectLabel = SUBJECTS.find((item) => item.value === subject)?.label ?? 'Materia'
  const gradeLabel = GRADES.find((item) => item.value === grade)?.label ?? grade

  if (subject === 'matematicas' && grade === '5-basico' && description) {
    const topic = detectMathTopic(description)
    const grounded = topic ? mathTopicContext(topic.id, gradeLabel) : undefined
    if (grounded) return grounded
  }

  const focus =
    subject === 'otra'
      ? 'comprensión profunda, resolución guiada y comunicación clara'
      : FOCUS[subject]

  return `Referencia curricular chilena para ${gradeLabel}, ${subjectLabel}: prioriza ${focus}. Úsala como orientación, sin limitar preguntas interdisciplinarias, tecnológicas o actuales.`
}
