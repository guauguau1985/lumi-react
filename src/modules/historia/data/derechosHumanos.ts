// Contenido de la Unidad 4 de Historia, Geografía y Ciencias Sociales 5° básico:
// "Derechos humanos, el Estado y nuestros deberes".
// Fuentes: cuaderno de clases (septiembre 2026) + Programa de Estudio Mineduc
// 5° básico, Formación Ciudadana, OA 13, 14, 15 y 16.
// En los textos, **palabra** se muestra en negrita.

export type Fuente = "cuaderno" | "mineduc";

export type Tema =
  | "Conceptos"
  | "Documentos"
  | "Generaciones"
  | "El Estado"
  | "Deberes";

export interface Ficha {
  id: string;
  tema: Tema;
  fuente: Fuente;
  titulo: string;
  emoji: string;
  puntos: string[];
  clave?: string;
}

export const TEMAS: Tema[] = [
  "Conceptos",
  "Documentos",
  "Generaciones",
  "El Estado",
  "Deberes",
];

export const FICHAS: Ficha[] = [
  {
    id: "que-son",
    tema: "Conceptos",
    fuente: "cuaderno",
    emoji: "🧑‍🤝‍🧑",
    titulo: "¿Qué son los derechos humanos?",
    puntos: [
      "Son un conjunto de **derechos fundamentales** que todas las personas tienen **por el simple hecho de ser seres humanos**.",
      "Aplican a todas las personas, en todas partes y en todo momento.",
      "**No se pueden negociar ni renunciar.**",
    ],
  },
  {
    id: "sujetos",
    tema: "Conceptos",
    fuente: "cuaderno",
    emoji: "👶",
    titulo: "Sujetos de derecho",
    puntos: [
      "Significa que **desde que nacemos**, todos sin excepción tenemos derechos fundamentales.",
      "Esos derechos deben ser respetados por **los pares** (compañeros), **la comunidad** y **el Estado**.",
    ],
    clave: "Los derechos no dependen de la etnia, el sexo ni el lugar de nacimiento.",
  },
  {
    id: "caracteristicas",
    tema: "Conceptos",
    fuente: "cuaderno",
    emoji: "🔑",
    titulo: "Las 4 características",
    puntos: [
      "**Universales:** son para todas las personas del mundo.",
      "**Irrenunciables** (inalienables): nadie puede renunciar a ellos ni quitárselos.",
      "**Indivisibles:** todos son igual de importantes; no se respeta uno y otro no.",
      "**Imprescriptibles:** no se vencen ni se pierden con el tiempo.",
    ],
  },
  {
    id: "clasificacion",
    tema: "Conceptos",
    fuente: "cuaderno",
    emoji: "🗂️",
    titulo: "Clasificación",
    puntos: [
      "**Civiles y políticos:** vida, libertad, votar.",
      "**Económicos:** trabajo, sueldo justo.",
      "**Sociales:** educación, salud, vivienda.",
      "**Culturales:** idioma, tradiciones, arte.",
    ],
  },
  {
    id: "declaracion-francesa",
    tema: "Documentos",
    fuente: "cuaderno",
    emoji: "🇫🇷",
    titulo: "Declaración de los Derechos del Hombre y del Ciudadano",
    puntos: [
      "Nace en la **Revolución Francesa (1789)**.",
      "Antes, la **independencia de EE.UU. (1775-1783)** había abierto la discusión sobre los derechos de las personas.",
      "Hablaba del **derecho a voto**, la **igualdad ante la ley** y el **derecho a la propiedad**.",
    ],
    clave: "Al principio, estos derechos solo se consideraban para los hombres.",
  },
  {
    id: "dudh",
    tema: "Documentos",
    fuente: "cuaderno",
    emoji: "🌍",
    titulo: "Declaración Universal de los Derechos Humanos",
    puntos: [
      "Se escribió **después de la Segunda Guerra Mundial** (ONU, **10 de diciembre de 1948**).",
      "Una comisión internacional dirigida por **Eleanor Roosevelt** redactó **30 derechos** fundamentales para **todas** las personas.",
      "Es un acuerdo moral entre las naciones que dio paso a nuevos acuerdos para respetar los derechos humanos.",
    ],
  },
  {
    id: "convencion-americana",
    tema: "Documentos",
    fuente: "cuaderno",
    emoji: "🌎",
    titulo: "Convención Americana sobre Derechos Humanos",
    puntos: [
      "Es el **tratado más importante del sistema interamericano** (los países de América) para promover y proteger los derechos humanos.",
      "También se llama **Pacto de San José de Costa Rica** (1969).",
    ],
  },
  {
    id: "derechos-nino",
    tema: "Documentos",
    fuente: "mineduc",
    emoji: "🧒",
    titulo: "Convención sobre los Derechos del Niño",
    puntos: [
      "Acuerdo de la ONU de **1989** que protege a **niños, niñas y adolescentes** (menores de 18 años).",
      "Chile la firmó en **1990**.",
      "Ejemplos: derecho a la educación, a jugar, a la salud y a ser escuchados.",
    ],
  },
  {
    id: "generaciones",
    tema: "Generaciones",
    fuente: "cuaderno",
    emoji: "🧭",
    titulo: "Las 3 generaciones de derechos",
    puntos: [
      "**1ª generación:** Revolución Francesa. Derechos **civiles y políticos**. Sujeto: el **individuo**.",
      "**2ª generación:** revoluciones socialistas. Derechos **económicos, sociales y culturales**. Sujeto: lo **colectivo**.",
      "**3ª generación:** revoluciones anticoloniales. Derecho **al desarrollo, a la paz y al medio ambiente**. Sujeto: los **pueblos**.",
    ],
  },
  {
    id: "ejemplos-generaciones",
    tema: "Generaciones",
    fuente: "cuaderno",
    emoji: "🎨",
    titulo: "Ejemplos del cuaderno",
    puntos: [
      "🗣️ Libertad de opinión y de expresión → **1ª generación**",
      "⚖️ Igualdad ante la ley → **1ª generación**",
      "🏠 Derecho a la propiedad → **1ª generación**",
      "🌱 Vivir en un medio ambiente libre de contaminación → **3ª generación**",
    ],
  },
  {
    id: "estado",
    tema: "El Estado",
    fuente: "cuaderno",
    emoji: "🏛️",
    titulo: "¿Qué es el Estado?",
    puntos: [
      "Es la **organización política de nuestro país**.",
      "Su misión principal es buscar el **bien común**: que todas las personas que viven en Chile puedan desarrollarse de manera feliz y segura.",
    ],
    clave: "El Estado no es solo el gobierno: está al servicio de las personas.",
  },
  {
    id: "garante",
    tema: "El Estado",
    fuente: "cuaderno",
    emoji: "🤝",
    titulo: "El Estado como garante",
    puntos: [
      "Un **garante** es alguien que **asegura o firma un compromiso**.",
      "El Estado de Chile tiene la obligación de **proteger y hacer respetar** los derechos humanos de todos sus habitantes, sin importar su edad, origen o situación económica.",
    ],
  },
  {
    id: "igualdad",
    tema: "El Estado",
    fuente: "cuaderno",
    emoji: "⚖️",
    titulo: "La igualdad de los derechos",
    puntos: [
      "¡Todos somos iguales en dignidad!",
      "No importa de dónde vengas, tu género o tus gustos: el Estado debe protegerte por igual.",
      "El **respeto mutuo** es la base de nuestra convivencia.",
    ],
    clave:
      "La Constitución dice: “Las personas nacen libres e iguales en dignidad y derechos”. Esta frase asegura que todos tengamos las mismas oportunidades.",
  },
  {
    id: "deber-estado",
    tema: "El Estado",
    fuente: "cuaderno",
    emoji: "🛡️",
    titulo: "Un deber del Estado",
    puntos: [
      "Según la Constitución, es deber del Estado **resguardar la seguridad nacional**.",
      "También debe **dar protección a la población y a la familia**.",
    ],
  },
  {
    id: "deberes",
    tema: "Deberes",
    fuente: "mineduc",
    emoji: "📜",
    titulo: "Los derechos generan deberes",
    puntos: [
      "**Las personas deben** respetar los derechos de los demás y respetar las leyes.",
      "**El Estado debe asegurar** que podamos ejercer nuestros derechos: educación, salud, libertad de expresión, propiedad privada e igualdad ante la ley.",
    ],
  },
  {
    id: "participar",
    tema: "Deberes",
    fuente: "mineduc",
    emoji: "🗳️",
    titulo: "Derecho a participar",
    puntos: [
      "El Estado debe asegurar que participemos en la **vida pública**:",
      "Formar organizaciones, como fundaciones y **juntas de vecinos**.",
      "Participar en **partidos políticos**.",
      "Votar: el **derecho a sufragio**.",
    ],
  },
  {
    id: "civicas",
    tema: "Deberes",
    fuente: "mineduc",
    emoji: "🌟",
    titulo: "Mérito y actitudes cívicas",
    puntos: [
      "Hay logros que dependen de **nuestro esfuerzo**: notas, premios deportivos, premio al compañerismo, liderazgo.",
      "Actitudes cívicas: ser **honesto** (no copiar), **respetar a todos** sin discriminar, **resolver conflictos en paz** y **cuidar el medio ambiente y el patrimonio**.",
    ],
  },
];

export interface PreguntaQuiz {
  pregunta: string;
  /** La primera opción es siempre la correcta; se barajan al mostrarlas. */
  opciones: [string, string, string, string];
  explicacion: string;
}

export const PREGUNTAS: PreguntaQuiz[] = [
  { pregunta: "¿Qué significa ser “sujeto de derecho”?", opciones: ["Que desde que nacemos tenemos derechos fundamentales", "Que solo los adultos tienen derechos", "Que los derechos se ganan con buenas notas", "Que solo los chilenos tienen derechos"], explicacion: "Todos, sin excepción y desde que nacemos, tenemos derechos." },
  { pregunta: "Los derechos humanos los tenemos...", opciones: ["por el simple hecho de ser personas", "si los compramos", "si el gobierno nos los regala", "solo cuando cumplimos 18 años"], explicacion: "Son de todas las personas solo por ser seres humanos." },
  { pregunta: "¿Qué documento dice cuáles son nuestros derechos fundamentales?", opciones: ["La Declaración Universal de los Derechos Humanos", "El reglamento del colegio", "El diario", "El libro de clases"], explicacion: "La Declaración Universal (1948) reúne 30 derechos para todas las personas." },
  { pregunta: "“Los derechos humanos son para todas las personas del mundo.” ¿Qué característica es?", opciones: ["Universales", "Imprescriptibles", "Indivisibles", "Económicos"], explicacion: "Universal = para todos, en todas partes." },
  { pregunta: "Nadie puede renunciar a sus derechos ni venderlos. Son...", opciones: ["Irrenunciables", "Universales", "Colectivos", "Políticos"], explicacion: "Irrenunciables (o inalienables): no se pueden negociar ni entregar." },
  { pregunta: "Los derechos no se pierden ni se vencen con el paso del tiempo. Son...", opciones: ["Imprescriptibles", "Indivisibles", "Universales", "Sociales"], explicacion: "Imprescriptible = no caduca, dura toda la vida." },
  { pregunta: "No se puede respetar un derecho y otro no, porque todos son igual de importantes. Son...", opciones: ["Indivisibles", "Irrenunciables", "Imprescriptibles", "Culturales"], explicacion: "Indivisibles: van todos juntos." },
  { pregunta: "¿Después de qué hecho se escribió la Declaración Universal de los Derechos Humanos?", opciones: ["La Segunda Guerra Mundial", "La independencia de Chile", "La llegada de Colón", "La Revolución Francesa"], explicacion: "Se aprobó en 1948, después de la Segunda Guerra Mundial." },
  { pregunta: "¿Quién dirigió la comisión que redactó la Declaración Universal?", opciones: ["Eleanor Roosevelt", "Bernardo O'Higgins", "Napoleón", "Gabriela Mistral"], explicacion: "Eleanor Roosevelt dirigió la comisión internacional." },
  { pregunta: "¿Cuántos derechos (artículos) tiene la Declaración Universal?", opciones: ["30", "10", "100", "5"], explicacion: "Tiene 30 artículos." },
  { pregunta: "¿Qué hecho impulsó las discusiones sobre derechos antes de la Revolución Francesa?", opciones: ["La independencia de EE.UU. (1775-1783)", "La Segunda Guerra Mundial", "La Guerra del Pacífico", "La conquista de América"], explicacion: "La independencia de EE.UU. abrió el debate sobre voto, igualdad y propiedad." },
  { pregunta: "Al principio, los derechos de la Declaración del Hombre y del Ciudadano se consideraban solo para...", opciones: ["los hombres", "los niños", "todas las personas", "los reyes"], explicacion: "En un comienzo solo se les reconocían a los hombres." },
  { pregunta: "La Convención Americana sobre Derechos Humanos es...", opciones: ["el tratado más importante del sistema interamericano", "una ley solo de Chile", "un libro de cuentos", "un reglamento escolar"], explicacion: "Protege y promueve los derechos humanos en los países de América." },
  { pregunta: "Los derechos civiles y políticos (como votar y opinar) son de...", opciones: ["1ª generación", "2ª generación", "3ª generación", "ninguna generación"], explicacion: "Nacen con la Revolución Francesa. Sujeto: el individuo." },
  { pregunta: "Los derechos económicos, sociales y culturales (educación, salud, trabajo) son de...", opciones: ["2ª generación", "1ª generación", "3ª generación", "4ª generación"], explicacion: "Nacen con las revoluciones socialistas. Sujeto: lo colectivo." },
  { pregunta: "El derecho a vivir en un medio ambiente libre de contaminación es de...", opciones: ["3ª generación", "1ª generación", "2ª generación", "ninguna generación"], explicacion: "3ª generación: paz, desarrollo y medio ambiente. Sujeto: los pueblos." },
  { pregunta: "¿Qué contexto histórico tiene la 3ª generación de derechos?", opciones: ["Las revoluciones anticoloniales", "La Revolución Francesa", "Las revoluciones socialistas", "La independencia de Chile"], explicacion: "Los pueblos que se liberaron de las colonias pidieron paz y desarrollo." },
  { pregunta: "¿Qué es el Estado?", opciones: ["La organización política de nuestro país", "Solo el Presidente", "Una empresa", "Un partido político"], explicacion: "Ojo: el Estado no es solo el gobierno." },
  { pregunta: "¿Cuál es la misión principal del Estado?", opciones: ["Buscar el bien común", "Ganar dinero", "Ganar elecciones", "Organizar fiestas"], explicacion: "Bien común: que todos puedan desarrollarse de manera feliz y segura." },
  { pregunta: "¿Qué es un “garante”?", opciones: ["Alguien que asegura o firma un compromiso", "Un árbitro de fútbol", "Un tipo de ley", "Un impuesto"], explicacion: "El Estado es garante porque se compromete a proteger nuestros derechos." },
  { pregunta: "Según la Constitución, ¿cuál es un deber del Estado?", opciones: ["Resguardar la seguridad nacional y proteger a la población y a la familia", "Elegir los amigos de cada persona", "Decidir qué comemos", "Cobrar por ir al colegio"], explicacion: "Así lo dice el texto que copiaron en el cuaderno." },
  { pregunta: "¿Con qué frase se asegura que todos tengamos las mismas oportunidades?", opciones: ["“Las personas nacen libres e iguales en dignidad y derechos”", "“El que llega primero gana”", "“Cada uno se salva solo”", "“Los derechos son para algunos”"], explicacion: "Es el artículo 1 de la Constitución de Chile." },
  { pregunta: "¿Cuál de estos es un DEBER de las personas?", opciones: ["Respetar los derechos de los demás", "Votar a los 10 años", "Pensar igual que todos", "Darle órdenes al Estado"], explicacion: "Los derechos generan deberes: respetar a los demás y respetar las leyes." },
  { pregunta: "¿Cuál de estas es una forma de participar en la vida pública?", opciones: ["Votar (derecho a sufragio)", "Ver televisión", "Dormir siesta", "Jugar videojuegos"], explicacion: "También: juntas de vecinos, fundaciones y partidos políticos." },
  { pregunta: "Una junta de vecinos es un ejemplo de...", opciones: ["organización de participación social", "empresa privada", "derecho de 3ª generación", "tribunal"], explicacion: "El Estado debe asegurar que podamos formar organizaciones así." },
  { pregunta: "¿Los derechos de una persona dependen de su etnia, sexo o lugar de nacimiento?", opciones: ["No, son de todas las personas por igual", "Sí, depende del país", "Sí, depende del sexo", "Solo dependen de la edad"], explicacion: "El programa del Mineduc lo dice: no dependen de características individuales." },
  { pregunta: "Sacar una buena nota por estudiar harto es un ejemplo de...", opciones: ["un logro que depende del esfuerzo y el mérito", "un derecho humano", "un deber del Estado", "un derecho de 3ª generación"], explicacion: "Hay logros que dependen del esfuerzo de cada uno." },
  { pregunta: "¿Cuál de estas es una actitud cívica?", opciones: ["Resolver un conflicto conversando, sin pelear", "Copiar en la prueba", "Burlarse de un compañero", "Rayar las murallas"], explicacion: "Actitudes cívicas: honestidad, respeto, buena convivencia y cuidar el entorno." },
];

export type Generacion = 1 | 2 | 3;

export const GENERACIONES: Record<
  Generacion,
  { nombre: string; derechos: string; contexto: string; sujeto: string }
> = {
  1: {
    nombre: "1ª generación",
    derechos: "Civiles y políticos",
    contexto: "Revolución Francesa",
    sujeto: "El individuo",
  },
  2: {
    nombre: "2ª generación",
    derechos: "Económicos, sociales y culturales",
    contexto: "Revoluciones socialistas",
    sujeto: "Lo colectivo",
  },
  3: {
    nombre: "3ª generación",
    derechos: "Paz, desarrollo y medio ambiente",
    contexto: "Revoluciones anticoloniales",
    sujeto: "Los pueblos",
  },
};

export const DERECHOS_POR_GENERACION: { emoji: string; derecho: string; generacion: Generacion }[] = [
  { emoji: "🗳️", derecho: "Derecho a votar", generacion: 1 },
  { emoji: "🗣️", derecho: "Libertad de opinión y de expresión", generacion: 1 },
  { emoji: "⚖️", derecho: "Igualdad ante la ley", generacion: 1 },
  { emoji: "🏠", derecho: "Derecho a la propiedad", generacion: 1 },
  { emoji: "❤️", derecho: "Derecho a la vida", generacion: 1 },
  { emoji: "📚", derecho: "Derecho a la educación", generacion: 2 },
  { emoji: "🏥", derecho: "Derecho a la salud", generacion: 2 },
  { emoji: "👷", derecho: "Derecho al trabajo y a un sueldo justo", generacion: 2 },
  { emoji: "🎭", derecho: "Derecho a participar en la cultura", generacion: 2 },
  { emoji: "🌱", derecho: "Medio ambiente libre de contaminación", generacion: 3 },
  { emoji: "🕊️", derecho: "Derecho a la paz", generacion: 3 },
  { emoji: "🚀", derecho: "Derecho al desarrollo de los pueblos", generacion: 3 },
];

export const PAREJAS_MEMORICE: { concepto: string; significado: string }[] = [
  { concepto: "Universales", significado: "Son para todas las personas del mundo" },
  { concepto: "Irrenunciables", significado: "Nadie puede renunciar a ellos ni venderlos" },
  { concepto: "Indivisibles", significado: "Todos son igual de importantes" },
  { concepto: "Imprescriptibles", significado: "No se vencen con el tiempo" },
  { concepto: "Garante", significado: "Quien asegura o firma un compromiso" },
  { concepto: "Bien común", significado: "Que todos vivan felices y seguros" },
];

export function barajar<T>(lista: readonly T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
