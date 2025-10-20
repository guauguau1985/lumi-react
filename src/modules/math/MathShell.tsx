import { NavLink, Routes, Route } from "react-router-dom";
import WorldsMap from "@/modules/WorldsMap";

export default function MathShell() {
  return (
    <div className="min-h-svh p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-sky-50">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-indigo-700">Módulo Matemáticas ➗</h1>
        <NavLink to="/" className="px-3 py-1 rounded-lg bg-white">⬅️ Inicio</NavLink>
      </header>

      <nav className="mt-3 flex gap-2 text-sm">
        <NavLink to="" end className="px-3 py-1 rounded-lg bg-white">Mapa</NavLink>
        {/* aquí después agregamos tabs por juego si quieres */}
      </nav>

      <Routes>
        <Route index element={<WorldsMap />} />
      </Routes>
    </div>
  );
}
