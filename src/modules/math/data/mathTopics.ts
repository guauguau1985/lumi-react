export type LessonStatus = "available" | "locked";

export interface Lesson {
  id: string;
  title: string;
  status: LessonStatus;
  route?: string; // ruta relativa dentro de /math si el juego ya existe
}

export interface MathTopic {
  id: string;
  title: string;
  emoji: string;
  description: string;
  lessons: Lesson[];
}

export const mathTopics: MathTopic[] = [
  {
    id: "numeros",
    title: "Números",
    emoji: "🔢",
    description: "Números grandes y valor posicional",
    lessons: [
      {
        id: "oa1",
        title: "Números hasta 1.000 millones",
        status: "available",
        route: "oa1",
      },
    ],
  },
  {
    id: "multiplicacion",
    title: "Multiplicación",
    emoji: "✖️",
    description: "Estrategias y algoritmos",
    lessons: [
      {
        id: "oa2",
        title: "Cálculo mental",
        status: "available",
        route: "oa2",
      },
      { id: "oa3", title: "Multiplicar dos cifras", status: "locked" },
    ],
  },
  {
    id: "division",
    title: "División",
    emoji: "➗",
    description: "Dividir y resolver problemas",
    lessons: [
      {
        id: "oa4",
        title: "División con resto",
        status: "available",
        route: "divisiones/dividividi",
      },
      { id: "oa5", title: "Las cuatro operaciones", status: "locked" },
      { id: "oa6", title: "Problemas con dinero", status: "locked" },
    ],
  },
  {
    id: "fracciones",
    title: "Fracciones",
    emoji: "🍕",
    description: "Partes de un todo",
    lessons: [
      {
        id: "oa7",
        title: "Fracciones propias",
        status: "available",
        route: "oa8",
      },
      { id: "oa8", title: "Fracciones impropias y mixtas", status: "locked" },
      {
        id: "oa9",
        title: "Sumar y restar fracciones",
        status: "available",
        route: "oa9",
      },
      { id: "oa10", title: "Fracciones y decimales", status: "locked" },
    ],
  },
  {
    id: "decimales",
    title: "Decimales",
    emoji: "🔡",
    description: "Números con coma",
    lessons: [
      {
        id: "oa11",
        title: "Comparar y ordenar decimales",
        status: "available",
        route: "oa10",
      },
      { id: "oa12", title: "Sumar y restar decimales", status: "locked" },
      {
        id: "oa13",
        title: "Problemas con fracciones y decimales",
        status: "locked",
      },
    ],
  },
  {
    id: "algebra",
    title: "Álgebra",
    emoji: "🔣",
    description: "Patrones y ecuaciones",
    lessons: [
      { id: "oa14", title: "Patrones y sucesiones", status: "locked" },
      { id: "oa15", title: "Ecuaciones simples", status: "locked" },
    ],
  },
  {
    id: "geometria",
    title: "Geometría",
    emoji: "📐",
    description: "Figuras y espacio",
    lessons: [
      { id: "oa16", title: "Plano cartesiano", status: "locked" },
      { id: "oa17", title: "Figuras 2D y 3D", status: "locked" },
      { id: "oa18", title: "Traslación y simetría", status: "locked" },
    ],
  },
  {
    id: "medicion",
    title: "Medición",
    emoji: "📏",
    description: "Longitudes y áreas",
    lessons: [
      { id: "oa19", title: "Medir longitudes", status: "locked" },
      { id: "oa20", title: "Convertir unidades", status: "locked" },
      {
        id: "oa21",
        title: "Perímetro y área de rectángulos",
        status: "locked",
      },
      {
        id: "oa22",
        title: "Áreas de triángulos y paralelogramos",
        status: "locked",
      },
    ],
  },
  {
    id: "datos",
    title: "Datos y probabilidad",
    emoji: "📊",
    description: "Gráficos y chance",
    lessons: [
      { id: "oa23", title: "Promedio", status: "locked" },
      { id: "oa24", title: "¿Qué tan probable es?", status: "locked" },
      { id: "oa25", title: "Comparar probabilidades", status: "locked" },
      {
        id: "oa26",
        title: "Leer gráficos",
        status: "available",
        route: "oa11",
      },
      { id: "oa27", title: "Diagrama de tallo y hojas", status: "locked" },
    ],
  },
];
