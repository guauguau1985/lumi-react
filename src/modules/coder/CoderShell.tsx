// src/modules/coder/CoderShell.tsx
import { NavLink, Routes, Route } from "react-router-dom";

function CoderHome() {
  return (
    <div className="mt-4 bg-white rounded-2xl shadow p-5">
      <p className="text-gray-800">Pronto: secuencias, bucles y condicionales con Lumi 👩‍💻</p>
    </div>
  );
}

export default function CoderShell() {
  return (
    <div className="min-h-svh p-4 sm:p-6 bg-gradient-to-br from-amber-50 to-rose-50">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-amber-700">Módulo Programador</h1>
        <NavLink to="/" className="px-3 py-1 rounded-lg bg-white">⬅️ Inicio</NavLink>
      </header>

      <nav className="mt-3 flex gap-2 text-sm">
        <NavLink to="" end className="px-3 py-1 rounded-lg bg-white">Inicio</NavLink>
      </nav>

      <Routes>
        <Route index element={<CoderHome />} />
      </Routes>
    </div>
  );
}
