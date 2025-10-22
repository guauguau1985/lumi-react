// src/modules/math/MathShell.tsx
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import WorldsMap from "@/modules/math/WorldsMap";
import DivisionShell from "@/modules/math/games/divisiones/DivisionShell";

// JUEGOS DIRECTO DESDE modules/math/games
import GameEscaleraNumerica from "@/modules/math/games/GameEscaleraNumerica";
import GameRayosMagicos     from "@/modules/math/games/GameRayosMagicos";
import GameFraccionesPizza  from "@/modules/math/games/GameFraccionesPizza";
import GameSumaFracciones   from "@/modules/math/games/GameSumaFracciones";
import GameAcuarioDecimal   from "@/modules/math/games/GameAcuarioDecimal";
import GameBarrasDatos      from "@/modules/math/games/GameBarrasDatos";
import GameRelojAventurero  from "@/modules/math/games/GameRelojAventurero";

export default function MathShell() {
  return (
    <div className="min-h-svh p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-sky-50">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-indigo-700">Módulo Matemáticas ➗</h1>
        <NavLink to="/" className="px-3 py-1 rounded-lg bg-white">⬅️ Inicio</NavLink>
      </header>

      <nav className="mt-3 flex gap-2 text-sm">
        <NavLink to="" end className="px-3 py-1 rounded-lg bg-white">Mapa</NavLink>
        <NavLink to="divisiones" className="px-3 py-1 rounded-lg bg-white">Divisiones</NavLink>
      </nav>

      <Routes>
        {/* Índice */}
        <Route index element={<WorldsMap />} />

        {/* OA existentes */}
        <Route path="oa1"  element={<BackWrap><GameEscaleraNumerica/></BackWrap>} />
        <Route path="oa2"  element={<BackWrap><GameRayosMagicos/></BackWrap>} />
        <Route path="oa3"  element={<ComingSoon title="OA3 · Mercado" />} />
        <Route path="oa8"  element={<BackWrap><GameFraccionesPizza/></BackWrap>} />
        <Route path="oa9"  element={<BackWrap><GameSumaFracciones/></BackWrap>} />
        <Route path="oa10" element={<BackWrap><GameAcuarioDecimal/></BackWrap>} />
        <Route path="oa11" element={<BackWrap><GameBarrasDatos/></BackWrap>} />
        <Route path="oa12" element={<BackWrap><GameRelojAventurero/></BackWrap>} />

        {/* Divisiones */}
        <Route path="divisiones/*" element={<DivisionShell />} />
      </Routes>
    </div>
  );
}

/* Wrapper con botón Volver al mapa */
/* No depende de AppShell */
function BackWrap({ children }: { children: React.ReactNode }) {
  const n = useNavigate();
  return (
    <div className="relative">
      <button
        onClick={() => n("/math")}
        className="absolute top-3 right-3 z-10 rounded-lg bg-white/90 px-3 py-1 shadow"
      >
        Volver al mapa
      </button>
      <div className="pt-12">{children}</div>
    </div>
  );
}

function ComingSoon({ title }: { title: string }) {
  const n = useNavigate();
  return (
    <div className="max-w-3xl mx-auto mt-10 text-center space-y-4">
      <h2 className="text-2xl font-bold text-indigo-700">{title}</h2>
      <p className="text-slate-600">Estamos preparando esta actividad para ti. ¡Muy pronto podrás explorarla!</p>
      <button onClick={() => n("/math")} className="px-4 py-2 rounded-lg bg-white shadow border">
        Volver al mapa
      </button>
    </div>
  );
}
