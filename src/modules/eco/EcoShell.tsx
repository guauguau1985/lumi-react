// src/modules/eco/EcoShell.tsx
import { NavLink, Routes, Route } from "react-router-dom";
import EcoHome from "@/pages/eco/EcoHome";
import EcoSorter from "@/pages/eco/EcoSorter";
import FootprintQuiz from "@/pages/eco/FootprintQuiz";
import CompostLab from "@/pages/eco/CompostLab";

export default function EcoShell() {
  return (
    <div className="min-h-svh p-4 sm:p-6 bg-gradient-to-br from-emerald-50 to-sky-50">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-emerald-700">Módulo Eco ♻️</h1>
        <NavLink to="/" className="px-3 py-1 rounded-lg bg-white">⬅️ Inicio</NavLink>
      </header>

      <nav className="mt-3 flex gap-2 text-sm">
        <NavLink to="" end className="px-3 py-1 rounded-lg bg-white">Inicio</NavLink>
        <NavLink to="sorter" className="px-3 py-1 rounded-lg bg-white">Clasificador</NavLink>
        <NavLink to="huella" className="px-3 py-1 rounded-lg bg-white">Quiz</NavLink>
        <NavLink to="compost" className="px-3 py-1 rounded-lg bg-white">Compost</NavLink>
      </nav>

      <Routes>
        <Route index element={<EcoHome />} />
        <Route path="sorter" element={<EcoSorter />} />
        <Route path="huella" element={<FootprintQuiz />} />
        <Route path="compost" element={<CompostLab />} />
      </Routes>
    </div>
  );
}
