// src/config/modules.ts
// Registro central de módulos de Lumi.
// enabled: false → la ruta no se registra en App.tsx y el acceso directo redirige a /.

export type ModuleVariant =
  | "math"
  | "eco"
  | "naturales"
  | "coder"
  | "english"
  | "ai";

export interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  path: string;
  emoji: string;
  variant: ModuleVariant;
  enabled: boolean;
}

export const MODULE_LIST: ModuleConfig[] = [
  {
    id: "math",
    name: "Matemáticas",
    description: "Números, fracciones, divisiones y más",
    path: "/math",
    emoji: "🧮",
    variant: "math",
    enabled: true,
  },
  {
    id: "eco",
    name: "Ecología",
    description: "Reciclaje, huella ecológica y compost",
    path: "/eco",
    emoji: "🌿",
    variant: "eco",
    enabled: true,
  },
  {
    id: "naturales",
    name: "Ciencias Naturales",
    description: "El agua, los seres vivos y el mundo natural",
    path: "/naturales",
    emoji: "🔬",
    variant: "naturales",
    enabled: true,
  },
  {
    id: "coder",
    name: "Programación",
    description: "Lógica, comandos y pensamiento computacional",
    path: "/coder",
    emoji: "💻",
    variant: "coder",
    enabled: false,
  },
  {
    id: "english",
    name: "Inglés",
    description: "Vocabulario y frases en inglés",
    path: "/english",
    emoji: "🇬🇧",
    variant: "english",
    enabled: false,
  },
  {
    id: "ai",
    name: "Inteligencia Artificial",
    description: "Tu tutora Lumi responde tus dudas de estudio",
    path: "/ai",
    emoji: "🤖",
    variant: "ai",
    enabled: true,
  },
];

// Mapa de flags booleanos — App.tsx usa este objeto para registrar rutas.
// Se genera automáticamente desde MODULE_LIST para evitar duplicación.
export const modules = Object.fromEntries(
  MODULE_LIST.map((m) => [m.id, m.enabled])
) as Record<string, boolean>;
