// Contenido de la ruta rápida "IA en tu trabajo" de Lumi Pro.
// Cada lección sigue el mismo ciclo de 5 pasos (ver la investigación
// "Cómo aprenden IA los adultos"):
//   1. Para qué sirve      → el adulto necesita saber por qué aprende algo
//   2. Ejemplo resuelto    → reduce la carga cognitiva del novato
//   3. Practica tu caso    → el tutor da pistas, no la respuesta
//   4. Responde de memoria → práctica de recuperación
//   5. Mini tarea          → aplicar el mismo día en el trabajo real
// Las preguntas del paso 4 vuelven después en el repaso espaciado.

export interface ProQuestion {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface ProExampleStep {
  label: string
  text: string
  note?: string
}

export interface ProLesson {
  id: string
  week: number
  order: number
  title: string
  minutes: number
  goal: string
  why: string
  example: {
    intro: string
    steps: ProExampleStep[]
    takeaway: string
  }
  practice: {
    instruction: string
    placeholder: string
    criteria: string[]
  }
  questions: ProQuestion[]
  miniTask: string
}

export interface ProWeek {
  number: number
  title: string
  outcome: string
  lessonTitles: string[]
  available: boolean
}

export const PRO_AREAS = [
  { id: 'administracion', label: 'Administración y finanzas' },
  { id: 'ventas', label: 'Ventas y atención a clientes' },
  { id: 'docencia', label: 'Docencia y educación' },
  { id: 'salud', label: 'Salud' },
  { id: 'emprendimiento', label: 'Emprendimiento y pyme' },
  { id: 'general', label: 'Otra área' },
] as const

export type ProAreaId = (typeof PRO_AREAS)[number]['id']

export const PRO_WEEKS: ProWeek[] = [
  {
    number: 1,
    title: 'Primeros pasos',
    outcome: 'Usar un asistente de IA a diario para escribir y resumir',
    lessonTitles: [
      'Qué hace bien y qué no la IA',
      'Tu primer prompt con estructura',
      'Redactar y responder correos',
      'Resumir documentos largos',
      'Reto: ahorra 30 minutos esta semana',
    ],
    available: true,
  },
  {
    number: 2,
    title: 'Productividad diaria',
    outcome: 'Delegar a la IA las tareas repetitivas de tu semana',
    lessonTitles: [
      'Actas y tareas de una reunión',
      'Planillas: fórmulas explicadas y datos ordenados',
      'Esquemas para presentaciones',
      'Buscar información y contrastarla',
      'Tu biblioteca de prompts reutilizables',
    ],
    available: false,
  },
  {
    number: 3,
    title: 'Criterio y seguridad',
    outcome: 'Saber cuándo confiar y cuándo no, sin exponer datos sensibles',
    lessonTitles: [
      'Dónde falla: cálculos, cifras y citas inventadas',
      'Cómo verificar una respuesta',
      'Datos confidenciales y privacidad',
      'Sesgos',
      'Revisar y corregir lo que produce la IA',
    ],
    available: false,
  },
  {
    number: 4,
    title: 'Tu primer flujo',
    outcome: 'Tener un proceso propio funcionando con IA',
    lessonTitles: [
      'Mapear una tarea repetitiva tuya',
      'Crear un asistente personalizado para tu área',
      'Una automatización simple con n8n',
      'Medir minutos ahorrados',
      'Proyecto final',
    ],
    available: false,
  },
]

export const PRO_LESSONS: ProLesson[] = [
  {
    id: 's1-l1',
    week: 1,
    order: 1,
    title: 'Qué hace bien y qué no la IA',
    minutes: 15,
    goal: 'Distinguir en qué tareas de tu trabajo la IA te ahorra tiempo y en cuáles debes desconfiar.',
    why: 'En un estudio con 758 consultores, la IA mejoró 40% la calidad en tareas para las que sirve, pero en una tarea fuera de su alcance quienes la usaron acertaron 19 puntos menos. Saber elegir la tarea es la primera habilidad.',
    example: {
      intro: 'Así clasifica sus tareas Carolina, asistente administrativa de una pyme:',
      steps: [
        {
          label: 'Buena para IA',
          text: 'Redactar el borrador de un correo para reagendar una reunión.',
          note: 'Escribir, reformular y ordenar ideas es donde la IA es más confiable.',
        },
        {
          label: 'Buena para IA',
          text: 'Resumir un informe de 10 páginas en 5 puntos.',
          note: 'Ahorra tiempo, y Carolina puede comprobar el resumen contra el original.',
        },
        {
          label: 'Con cuidado',
          text: 'Calcular el total con IVA de 40 facturas.',
          note: 'Los modelos de lenguaje se equivocan en cálculos largos. Mejor una planilla.',
        },
        {
          label: 'Con cuidado',
          text: 'Saber el valor del dólar hoy o citar un artículo exacto de una ley.',
          note: 'Puede entregar datos desactualizados o inventados con total seguridad. Siempre verificar en la fuente.',
        },
      ],
      takeaway: 'Regla simple: la IA es buena con palabras e ideas; desconfía cuando pides números exactos, datos actuales o citas.',
    },
    practice: {
      instruction:
        'Escribe 3 tareas que haces cada semana en tu trabajo y, al lado de cada una, si crees que es "buena para IA" o "con cuidado". El tutor revisará tu clasificación.',
      placeholder:
        '1. Responder consultas de clientes por correo → buena para IA\n2. ...\n3. ...',
      criteria: [
        'Nombra 3 tareas concretas de su trabajo',
        'Clasifica cada una',
        'Las tareas con números exactos, datos actuales o citas quedan como "con cuidado"',
      ],
    },
    questions: [
      {
        id: 's1-l1-q1',
        prompt: '¿Cuál de estas tareas es más segura de delegar a la IA?',
        options: [
          'Calcular el IVA de 40 facturas',
          'Escribir el borrador de un correo para pedir una reunión',
          'Citar el artículo exacto de una ley',
          'Averiguar el precio del dólar de hoy',
        ],
        correctIndex: 1,
        explanation:
          'Redactar es donde la IA es más confiable. Los cálculos largos, las citas exactas y los datos del día son justamente donde suele equivocarse.',
      },
      {
        id: 's1-l1-q2',
        prompt: 'La IA te entrega una cifra muy precisa y hasta menciona una fuente. ¿Qué haces?',
        options: [
          'La uso tal cual: si cita una fuente, está bien',
          'La verifico en la fuente original antes de usarla',
          'Le pregunto a la IA si está segura',
          'La redondeo para que sea menos arriesgada',
        ],
        correctIndex: 1,
        explanation:
          'La IA puede inventar cifras y fuentes con total seguridad. Preguntarle "¿estás segura?" no sirve: hay que revisar la fuente real.',
      },
      {
        id: 's1-l1-q3',
        prompt: '¿Por qué un asistente de IA a veces inventa datos?',
        options: [
          'Porque quiere engañar al usuario',
          'Porque genera el texto más probable, no consulta una base de datos verificada',
          'Porque su conexión a internet falla',
          'Porque se cansa en conversaciones largas',
        ],
        correctIndex: 1,
        explanation:
          'Un modelo de lenguaje predice palabras probables. Por eso escribe muy bien, pero puede producir datos que suenan correctos y no lo son.',
      },
    ],
    miniTask:
      'Hoy, usa la IA en una de tus tareas "buena para IA" y fíjate cuántos minutos te ahorró. Mañana Lumi Pro te preguntará cómo te fue.',
  },
  {
    id: 's1-l2',
    week: 1,
    order: 2,
    title: 'Tu primer prompt con estructura',
    minutes: 15,
    goal: 'Escribir pedidos a la IA con 4 partes, para obtener resultados útiles al primer intento.',
    why: 'La mayoría de las respuestas malas vienen de pedidos vagos. Una estructura simple te ahorra ir y volver corrigiendo.',
    example: {
      intro: 'Compara un pedido vago con uno estructurado para la misma tarea:',
      steps: [
        {
          label: 'Pedido vago',
          text: 'Hazme un correo para un cliente.',
          note: 'La IA no sabe para qué, a quién ni cómo. Va a adivinar.',
        },
        {
          label: 'Rol',
          text: 'Actúa como asistente administrativa de una pyme de Talca.',
          note: 'Le dice desde qué perspectiva escribir.',
        },
        {
          label: 'Tarea',
          text: 'Redacta un correo para recordarle a un cliente una factura vencida hace 15 días.',
          note: 'Qué tiene que producir, con el dato clave.',
        },
        {
          label: 'Contexto',
          text: 'Es un cliente antiguo y buen pagador; queremos cuidar la relación.',
          note: 'Lo que tú sabes y la IA no. Esto cambia el tono.',
        },
        {
          label: 'Formato',
          text: 'Máximo 120 palabras, tono cordial, con línea de asunto.',
          note: 'Así recibes algo listo para usar.',
        },
      ],
      takeaway: 'Rol, Tarea, Contexto y Formato. No siempre necesitas las cuatro, pero revisa que no falte ninguna importante.',
    },
    practice: {
      instruction:
        'Elige una tarea real de tu semana y escribe un prompt con las 4 partes: rol, tarea, contexto y formato. El tutor te dirá qué parte se puede mejorar.',
      placeholder:
        'Rol: ...\nTarea: ...\nContexto: ...\nFormato: ...',
      criteria: [
        'Incluye rol, tarea, contexto y formato',
        'La tarea es concreta y corresponde a su trabajo',
        'El contexto aporta información que la IA no podría adivinar',
      ],
    },
    questions: [
      {
        id: 's1-l2-q1',
        prompt: '"Eres contador. Resume este informe." ¿Qué le falta principalmente a este pedido?',
        options: [
          'El rol',
          'Contexto y formato: para quién es y cómo lo quieres',
          'Nada, está completo',
          'Decir "por favor"',
        ],
        correctIndex: 1,
        explanation:
          'Tiene rol y tarea, pero no dice para quién es el resumen ni qué largo o estructura necesitas. Con eso la respuesta cambia mucho.',
      },
      {
        id: 's1-l2-q2',
        prompt: '¿Para qué sirve indicar el formato en un prompt?',
        options: [
          'Para que la IA responda más rápido',
          'Para recibir un resultado listo para usar, sin rehacerlo',
          'Para que la IA no invente datos',
          'No sirve; la IA elige el mejor formato sola',
        ],
        correctIndex: 1,
        explanation:
          'El formato (largo, tono, viñetas, tabla) define cómo llega el resultado. Sin él, casi siempre tendrás que pedir cambios.',
      },
      {
        id: 's1-l2-q3',
        prompt: 'La primera respuesta de la IA no te sirve. ¿Qué es lo más efectivo?',
        options: [
          'Empezar una conversación nueva con el mismo pedido',
          'Pedir ajustes concretos en la misma conversación',
          'Concluir que la IA no sirve para esa tarea',
          'Escribir el pedido en inglés',
        ],
        correctIndex: 1,
        explanation:
          'En la misma conversación la IA recuerda lo anterior. Decir exactamente qué cambiar ("más breve", "sin tecnicismos") suele bastar.',
      },
    ],
    miniTask:
      'Guarda tu mejor prompt de hoy en una nota llamada "Mis prompts". Úsalo de nuevo esta semana cambiando solo el contexto.',
  },
  {
    id: 's1-l3',
    week: 1,
    order: 3,
    title: 'Redactar y responder correos',
    minutes: 15,
    goal: 'Responder correos con ayuda de la IA en menos tiempo, sin exponer datos confidenciales.',
    why: 'En soporte al cliente, la IA aumentó 34% la productividad de las personas con menos experiencia. Los correos son la forma más rápida de notar ese ahorro.',
    example: {
      intro: 'Así responde Carolina un correo de un proveedor que pide adelantar una reunión:',
      steps: [
        {
          label: 'Primero protege los datos',
          text: 'Reemplaza nombres, RUT, montos y direcciones: "Hola [NOMBRE], necesitamos adelantar la reunión del martes por el pedido de [MONTO]..."',
          note: 'Nunca pegues datos personales o confidenciales en una IA que no sea la autorizada por tu empresa.',
        },
        {
          label: 'Dile tu decisión',
          text: 'Responde este correo aceptando la reunión, pero propón el jueves a las 10:00 en vez del martes. Tono cercano, máximo 80 palabras.',
          note: 'La IA redacta; la decisión (qué responder) la pones tú.',
        },
        {
          label: 'Ajusta en la misma conversación',
          text: 'Hazlo más breve y quita la frase final de cortesía.',
          note: 'Pedidos de ajuste concretos, como en la lección anterior.',
        },
        {
          label: 'Revisa antes de enviar',
          text: 'Lee el correo completo y vuelve a poner los datos reales.',
          note: 'Tú eres responsable de lo que envías, no la IA.',
        },
      ],
      takeaway: 'Datos protegidos, tu decisión clara, ajustes concretos y revisión final.',
    },
    practice: {
      instruction:
        'Toma un correo real que tengas pendiente. Escribe aquí el prompt que usarías para responderlo, con los datos sensibles reemplazados por [ETIQUETAS]. El tutor revisará el prompt.',
      placeholder:
        'Correo recibido (sin datos sensibles): ...\n\nMi prompt: Responde este correo ...',
      criteria: [
        'No incluye datos personales ni confidenciales reales',
        'Deja clara la decisión o respuesta que quiere dar',
        'Indica tono y largo',
      ],
    },
    questions: [
      {
        id: 's1-l3-q1',
        prompt: 'Antes de pegar el correo de un cliente en un asistente de IA, debes:',
        options: [
          'Traducirlo al inglés',
          'Reemplazar nombres, RUT, montos y otros datos confidenciales',
          'Copiarlo completo para que la IA tenga todo el contexto',
          'Pedirle permiso a la IA',
        ],
        correctIndex: 1,
        explanation:
          'Lo que pegas puede quedar guardado fuera de tu empresa. Las etiquetas como [NOMBRE] mantienen el sentido sin exponer a nadie.',
      },
      {
        id: 's1-l3-q2',
        prompt: 'Además del correo recibido, ¿qué es lo más importante que le dices a la IA?',
        options: [
          'Que sea creativa',
          'Qué quieres responder, con qué tono y de qué largo',
          'Que use muchos emojis',
          'Que firme con tu nombre completo',
        ],
        correctIndex: 1,
        explanation:
          'Si no le das tu decisión, la IA la inventa. Tu postura, el tono y el largo hacen que el borrador sirva al primer intento.',
      },
      {
        id: 's1-l3-q3',
        prompt: 'La IA te entrega un correo bien escrito, pero promete un plazo que tú no ofreciste. ¿Qué haces?',
        options: [
          'Lo envío igual; suena profesional',
          'Lo corrijo antes de enviarlo',
          'Le pido a la IA que se disculpe',
          'Dejo de usar IA para correos',
        ],
        correctIndex: 1,
        explanation:
          'La IA completa con lo que parece probable. Revisar compromisos, fechas y montos antes de enviar es parte del trabajo.',
      },
    ],
    miniTask:
      'Responde hoy un correo real con ayuda de la IA, siguiendo los 4 pasos. Fíjate cuánto tardaste comparado con lo habitual.',
  },
  {
    id: 's1-l4',
    week: 1,
    order: 4,
    title: 'Resumir documentos largos',
    minutes: 15,
    goal: 'Obtener resúmenes útiles para una decisión y comprobar que la IA no inventó nada.',
    why: 'Leer documentos largos consume horas a la semana. Un buen resumen te deja decidir en minutos, siempre que sepas verificarlo.',
    example: {
      intro: 'Carolina debe preparar para su jefa un informe de 12 páginas sobre proveedores:',
      steps: [
        {
          label: 'Para quién y para qué',
          text: 'Resume este informe para mi jefa, que tiene 2 minutos y debe decidir si cambiamos de proveedor.',
          note: 'El destinatario define qué es importante.',
        },
        {
          label: 'Estructura',
          text: 'Dame: 3 conclusiones, 2 riesgos y la decisión que debe tomar.',
          note: 'Pedir una estructura evita resúmenes genéricos.',
        },
        {
          label: 'Freno a la invención',
          text: 'Si algo no está en el texto, di "no aparece en el documento".',
          note: 'Le da permiso a la IA para decir que no sabe.',
        },
        {
          label: 'Verificación',
          text: '¿En qué parte del documento dice lo del riesgo 2? Cita la frase.',
          note: 'Luego busca esa frase en el original para confirmarla.',
        },
      ],
      takeaway: 'Destinatario, estructura, permiso para decir "no aparece" y verificación de lo importante.',
    },
    practice: {
      instruction:
        'Piensa en un documento largo que tengas pendiente (informe, acta, contrato, reglamento). Escribe el prompt para resumirlo, indicando para quién es y qué estructura necesitas.',
      placeholder:
        'Documento: ...\nMi prompt: Resume este documento para ...',
      criteria: [
        'Indica destinatario o propósito',
        'Pide una estructura concreta',
        'Incluye alguna forma de evitar o detectar invenciones',
      ],
    },
    questions: [
      {
        id: 's1-l4-q1',
        prompt: '¿Cuál pedido de resumen dará un resultado más útil?',
        options: [
          'Resume esto',
          'Resume esto en pocas palabras',
          'Resume esto para mi jefa, que debe decidir hoy: 3 conclusiones y 2 riesgos',
          'Haz el mejor resumen posible',
        ],
        correctIndex: 2,
        explanation:
          'Con destinatario, propósito y estructura, la IA sabe qué priorizar.',
      },
      {
        id: 's1-l4-q2',
        prompt: '¿Cómo reduces el riesgo de que el resumen incluya algo inventado?',
        options: [
          'Pidiendo que cite la parte del texto y que diga "no aparece" si algo falta',
          'Pidiendo que el resumen sea más largo',
          'Usando la IA dos veces seguidas',
          'No se puede reducir',
        ],
        correctIndex: 0,
        explanation:
          'Pedir citas te permite comprobar en el original, y dar permiso para decir "no aparece" reduce las invenciones.',
      },
      {
        id: 's1-l4-q3',
        prompt: 'Resumiste un contrato con IA. ¿Cómo lo usas?',
        options: [
          'Lo firmo basándome en el resumen',
          'Me sirve para orientarme, pero reviso las cláusulas clave en el original',
          'Lo envío al cliente como versión oficial',
          'Lo descarto: la IA no sirve para contratos',
        ],
        correctIndex: 1,
        explanation:
          'El resumen ahorra tiempo para entender, pero las decisiones con consecuencias se toman leyendo el texto original.',
      },
    ],
    miniTask:
      'Resume hoy un documento real con este método y compara con tu propia lectura rápida: ¿se le escapó algo importante?',
  },
  {
    id: 's1-l5',
    week: 1,
    order: 5,
    title: 'Reto: ahorra 30 minutos esta semana',
    minutes: 15,
    goal: 'Armar un plan concreto para ahorrar al menos 30 minutos la próxima semana con lo aprendido.',
    why: 'Lo que se practica en el trabajo real se mantiene. Un plan con días y tareas concretas aumenta mucho la probabilidad de cumplirlo.',
    example: {
      intro: 'Este es el plan de Carolina para la próxima semana:',
      steps: [
        {
          label: 'Lunes',
          text: 'Responder los correos acumulados del fin de semana con IA.',
          note: 'Técnica: datos protegidos + decisión clara. Ahorro estimado: 15 min.',
        },
        {
          label: 'Miércoles',
          text: 'Resumir el acta de la reunión de equipo para quienes no asistieron.',
          note: 'Técnica: destinatario + estructura. Ahorro estimado: 10 min.',
        },
        {
          label: 'Viernes',
          text: 'Redactar el borrador del informe semanal a partir de sus notas.',
          note: 'Técnica: rol, tarea, contexto y formato. Ahorro estimado: 10 min.',
        },
      ],
      takeaway: 'Tres tareas, tres días, una técnica para cada una y una estimación de minutos.',
    },
    practice: {
      instruction:
        'Arma tu plan: 3 tareas de la próxima semana, el día en que las harás, la técnica que usarás en cada una y cuántos minutos crees que ahorrarás.',
      placeholder:
        'Lunes: ... (técnica: ...) ~__ min\nMiércoles: ...\nViernes: ...',
      criteria: [
        'Tres tareas concretas con día asignado',
        'Una técnica de la semana para cada tarea',
        'Una estimación de minutos ahorrados',
      ],
    },
    questions: [
      {
        id: 's1-l5-q1',
        prompt: '¿Cuáles son las 4 partes de un prompt con estructura?',
        options: [
          'Saludo, pedido, gracias y despedida',
          'Rol, tarea, contexto y formato',
          'Tema, largo, idioma y fecha',
          'Pregunta, respuesta, revisión y envío',
        ],
        correctIndex: 1,
        explanation: 'Rol, tarea, contexto y formato: la base de casi cualquier buen pedido.',
      },
      {
        id: 's1-l5-q2',
        prompt: '¿Qué tarea NO deberías delegar a la IA sin verificar después?',
        options: [
          'Reformular un párrafo para que sea más claro',
          'Proponer tres asuntos para un correo',
          'Indicar el monto exacto de una multa según la ley',
          'Ordenar ideas sueltas en una lista',
        ],
        correctIndex: 2,
        explanation:
          'Montos, leyes y datos exactos son terreno donde la IA puede inventar. Las otras tareas son de redacción.',
      },
      {
        id: 's1-l5-q3',
        prompt: 'Vas a pedir ayuda con un correo que menciona el sueldo de un trabajador. ¿Qué haces?',
        options: [
          'Lo pego tal cual',
          'Reemplazo el nombre y el monto por etiquetas antes de pegarlo',
          'Le pido a la IA que no guarde la información',
          'Escribo el sueldo en palabras en vez de números',
        ],
        correctIndex: 1,
        explanation:
          'Las etiquetas protegen los datos. Pedirle a la IA que "no guarde" no garantiza nada.',
      },
    ],
    miniTask:
      'Cumple tu plan la próxima semana y registra en Lumi Pro cuántos minutos ahorraste en cada tarea.',
  },
]

export function getLesson(id: string) {
  return PRO_LESSONS.find((lesson) => lesson.id === id) ?? null
}

export function getQuestion(id: string) {
  for (const lesson of PRO_LESSONS) {
    const question = lesson.questions.find((item) => item.id === id)
    if (question) return { lesson, question }
  }
  return null
}
