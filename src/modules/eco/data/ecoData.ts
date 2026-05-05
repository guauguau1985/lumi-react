export type Bin = "papel" | "plastico" | "vidrio" | "organico" | "peligroso";

export type EcoItem = {
  id: string;
  name: string;
  img: string; // ruta a SVG/PNG dentro de src/assets/eco
  bin: Bin;
};

import bin_papel from "@/assets/eco/bin_papel.svg?url";
import bin_plastico from "@/assets/eco/bin_plastico.svg?url";
import bin_vidrio from "@/assets/eco/bin_vidrio.svg?url";
import bin_organico from "@/assets/eco/bin_organico.svg?url";
import bin_peligroso from "@/assets/eco/bin_peligroso.svg?url";

import item_newspaper from "@/assets/eco/item_newspaper.svg?url";
import item_bottle_plastic from "@/assets/eco/item_bottle_plastic.svg?url";
import item_glass_jar from "@/assets/eco/item_glass_jar.svg?url";
import item_apple_core from "@/assets/eco/item_apple_core.svg?url";
import item_battery from "@/assets/eco/item_battery.svg?url";

export const BINS: { key: Bin; label: string; img: string }[] = [
  { key: "papel",     label: "Papel/Cartón", img: bin_papel },
  { key: "plastico",  label: "Plástico",     img: bin_plastico },
  { key: "vidrio",    label: "Vidrio",       img: bin_vidrio },
  { key: "organico",  label: "Orgánico",     img: bin_organico },
  { key: "peligroso", label: "Peligroso",    img: bin_peligroso },
];

export const SORTER_ITEMS: EcoItem[] = [
  { id: "n1", name: "Diario",            img: item_newspaper,     bin: "papel" },
  { id: "p1", name: "Botella plástica",  img: item_bottle_plastic,bin: "plastico" },
  { id: "g1", name: "Frasco de vidrio",  img: item_glass_jar,     bin: "vidrio" },
  { id: "o1", name: "Cáscara de manzana",img: item_apple_core,    bin: "organico" },
  { id: "x1", name: "Pila",              img: item_battery,       bin: "peligroso" },
];

export type QuizQ = {
  id: string;
  text: string;
  options: { id: string; text: string; correct: boolean }[];
  tip?: string;
};

export const FOOTPRINT_QUIZ: QuizQ[] = [
  {
    id: "q1",
    text: "¿Cuál acción ahorra más agua en casa?",
    options: [
      { id: "a", text: "Ducha corta (5 min)", correct: true },
      { id: "b", text: "Baño de tina",        correct: false },
      { id: "c", text: "Dejar la llave abierta", correct: false },
    ],
    tip: "Una ducha de 5 minutos gasta menos que llenar la tina.",
  },
  {
    id: "q2",
    text: "¿Qué foco consume menos energía?",
    options: [
      { id: "a", text: "LED",           correct: true },
      { id: "b", text: "Incandescente", correct: false },
      { id: "c", text: "Halógeno",      correct: false },
    ],
  },
  {
    id: "q3",
    text: "Para ir a la escuela, lo más sustentable es…",
    options: [
      { id: "a", text: "Auto con 1 persona",  correct: false },
      { id: "b", text: "Bicicleta o caminar", correct: true },
      { id: "c", text: "Moto",                correct: false },
    ],
  },
  {
    id: "q4",
    text: "¿Cuál NO va al compost?",
    options: [
      { id: "a", text: "Cáscaras de frutas", correct: false },
      { id: "b", text: "Restos de verduras", correct: false },
      { id: "c", text: "Pilas",              correct: true },
    ],
  },
  {
    id: "q5",
    text: "¿Qué es reutilizar?",
    options: [
      { id: "a", text: "Usar algo de nuevo para otra función", correct: true },
      { id: "b", text: "Quemar basura", correct: false },
      { id: "c", text: "Tirar todo junto", correct: false },
    ],
  },
  {
    id: "q6",
    text: "Si reciclas plástico, ¿qué ayudas a reducir?",
    options: [
      { id: "a", text: "Residuos en vertederos", correct: true },
      { id: "b", text: "Oxígeno del aire",       correct: false },
      { id: "c", text: "Lluvia",                 correct: false },
    ],
  },
];
