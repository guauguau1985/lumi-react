export type Bin = "papel" | "plastico" | "vidrio" | "organico" | "peligroso";

import React from "react";

export type EcoItem = {
  id: string;
  name: string;
  // SVG component generado por SVGR (componente React)
  img: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  bin: Bin;
};

import BinPapel from "@/components/icons/BinPapel";
import BinPlastico from "@/components/icons/BinPlastico";
import BinVidrio from "@/components/icons/BinVidrio";
import BinOrganico from "@/components/icons/BinOrganico";
import BinPeligroso from "@/components/icons/BinPeligroso";

import ItemNewspaper from "@/components/icons/ItemNewspaper";
import ItemBottlePlastic from "@/components/icons/ItemBottlePlastic";
import ItemGlassJar from "@/components/icons/ItemGlassJar";
import ItemAppleCore from "@/components/icons/ItemAppleCore";
import ItemBattery from "@/components/icons/ItemBattery";

export const BINS: { key: Bin; label: string; img: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
  { key: "papel",     label: "Papel/Cartón", img: BinPapel },
  { key: "plastico",  label: "Plástico",     img: BinPlastico },
  { key: "vidrio",    label: "Vidrio",       img: BinVidrio },
  { key: "organico",  label: "Orgánico",     img: BinOrganico },
  { key: "peligroso", label: "Peligroso",    img: BinPeligroso },
];

export const SORTER_ITEMS: EcoItem[] = [
  { id: "n1", name: "Diario",            img: ItemNewspaper,     bin: "papel" },
  { id: "p1", name: "Botella plástica",  img: ItemBottlePlastic,bin: "plastico" },
  { id: "g1", name: "Frasco de vidrio",  img: ItemGlassJar,     bin: "vidrio" },
  { id: "o1", name: "Cáscara de manzana",img: ItemAppleCore,    bin: "organico" },
  { id: "x1", name: "Pila",              img: ItemBattery,       bin: "peligroso" },
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
