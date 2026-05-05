// src/modules/math/games/divisiones/DivisionShell.tsx
import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import GameDivisionIntro    from "@/modules/math/games/divisiones/GameDivisionIntro";
import GameDivisionGuiada   from "@/modules/math/games/divisiones/GameDivisionGuiada";
import GameDivisionConResto from "@/modules/math/games/divisiones/GameDivisionConResto";
import GameDivisionQuiz     from "@/modules/math/games/divisiones/GameDivisionQuiz";

type Level = 1 | 2 | 3;

interface LevelConfig {
  level: Level;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  border: string;
  badge: string;
}

const levels: LevelConfig[] = [
  {
    level: 1,
    title: "Nivel 1",
    subtitle: "Introducción",
    description: "Aprende qué es dividir, sus partes y cómo comprobar el resultado.",
    icon: "🌱",
    color: "from-green-100 to-emerald-50",
    border: "border-emerald-300",
    badge: "bg-emerald-100 text-emerald-700",
  },
  {
    level: 2,
    title: "Nivel 2",
    subtitle: "Práctica guiada",
    description: "Divide paso a paso con ayuda y practica divisiones con resto.",
    icon: "⚡",
    color: "from-amber-100 to-yellow-50",
    border: "border-amber-300",
    badge: "bg-amber-100 text-amber-700",
  },
  {
    level: 3,
    title: "Nivel 3",
    subtitle: "Desafío final",
    description: "Pon a prueba todo lo que aprendiste con el quiz definitivo.",
    icon: "🏆",
    color: "from-orange-100 to-red-50",
    border: "border-orange-300",
    badge: "bg-orange-100 text-orange-700",
  },
];

type SubTab = "guiada" | "resto";

export default function DivisionShell() {
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [subTab, setSubTab] = useState<SubTab>("guiada");

  // ── Menú de selección de nivel ──────────────────────────────────────────────
  if (selectedLevel === null) {
    return (
      <div className="min-h-svh bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-amber-700">Aprende a Dividir</h1>
          <p className="mt-2 text-slate-500">Elige un nivel para comenzar</p>
        </header>

        <div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-3">
          {levels.map((lvl) => (
            <button
              key={lvl.level}
              type="button"
              onClick={() => setSelectedLevel(lvl.level)}
              className={`flex flex-col items-center gap-3 rounded-2xl border-2 ${
                lvl.border
              } bg-gradient-to-br ${lvl.color} p-6 shadow-md transition hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-300`}
            >
              <span className="text-5xl">{lvl.icon}</span>
              <span
                className={`rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wide ${
                  lvl.badge
                }`}
              >
                {lvl.title}
              </span>
              <span className="text-base font-semibold text-slate-700">{lvl.subtitle}</span>
              <p className="text-center text-sm text-slate-500">{lvl.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Contenido según el nivel seleccionado ────────────────────────────────────
  const currentLevel = levels.find((l) => l.level === selectedLevel)!;

  return (
    <div className="min-h-svh bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
      {/* Cabecera con botón para volver al menú */}
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSelectedLevel(null)}
          className="rounded-xl border border-amber-300 px-3 py-1.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
        >
          ← Niveles
        </button>
        <span
          className={`rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wide ${
            currentLevel.badge
          }`}
        >
          {currentLevel.icon} {currentLevel.title} — {currentLevel.subtitle}
        </span>
      </div>

      {/* Nivel 1: Introducción */}
      {selectedLevel === 1 && <GameDivisionIntro />}

      {/* Nivel 2: Guiada + Con Resto */}
      {selectedLevel === 2 && (
        <div className="flex flex-col gap-4">
          <nav className="flex gap-2">
            <button
              type="button"
              onClick={() => setSubTab("guiada")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                subTab === "guiada"
                  ? "bg-amber-500 text-white shadow"
                  : "border border-amber-300 text-amber-700 hover:bg-amber-50"
              }`}
            >
              Con ayuda
            </button>
            <button
              type="button"
              onClick={() => setSubTab("resto")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                subTab === "resto"
                  ? "bg-amber-500 text-white shadow"
                  : "border border-amber-300 text-amber-700 hover:bg-amber-50"
              }`}
            >
              Con resto
            </button>
          </nav>
          {subTab === "guiada" ? <GameDivisionGuiada /> : <GameDivisionConResto />}
        </div>
      )}

      {/* Nivel 3: Quiz */}
      {selectedLevel === 3 && <GameDivisionQuiz />}
    </div>
  );
}

