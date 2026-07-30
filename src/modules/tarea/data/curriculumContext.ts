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

export function curriculumContext(subject: HomeworkSubject, grade: string) {
  const subjectLabel = SUBJECTS.find((item) => item.value === subject)?.label ?? 'Materia'
  const gradeLabel = GRADES.find((item) => item.value === grade)?.label ?? grade
  const focus =
    subject === 'otra'
      ? 'comprensión profunda, resolución guiada y comunicación clara'
      : FOCUS[subject]

  return `Referencia curricular chilena para ${gradeLabel}, ${subjectLabel}: prioriza ${focus}. Úsala como orientación, sin limitar preguntas interdisciplinarias, tecnológicas o actuales.`
}
