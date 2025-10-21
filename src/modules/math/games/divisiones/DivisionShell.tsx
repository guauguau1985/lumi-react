// src/modules/math/games/divisiones/DivisionShell.tsx
import { NavLink, Routes, Route } from "react-router-dom";

import GameDivisionIntro    from "@/modules/math/games/divisiones/GameDivisionIntro";
import GameDivisionGuiada   from "@/modules/math/games/divisiones/GameDivisionGuiada";
import GameDivisionConResto from "@/modules/math/games/divisiones/GameDivisionConResto";
import GameDivisionQuiz     from "@/modules/math/games/divisiones/GameDivisionQuiz";

export default function DivisionShell() {
  return (
    <div className="min-h-svh p-4 bg-gradient-to-br from-yellow-50 to-orange-50">
      <h1 className="text-2xl font-bold text-amber-700">Aprende a Dividir</h1>

      <nav className="mt-3 flex gap-2">
        <NavLink to="" end>Introducción</NavLink>
        <NavLink to="guiada">Con ayuda</NavLink>
        <NavLink to="resto">Con resto</NavLink>
        <NavLink to="quiz">Desafío final</NavLink>
      </nav>

      <Routes>
        <Route index element={<GameDivisionIntro />} />
        <Route path="guiada" element={<GameDivisionGuiada />} />
        <Route path="resto"  element={<GameDivisionConResto />} />
        <Route path="quiz"   element={<GameDivisionQuiz />} />
      </Routes>
    </div>
  );
}

