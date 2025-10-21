// src/modules/math/MathShell.tsx
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import WorldsMap from "@/modules/math/WorldsMap";
import DivisionShell from "@/modules/math/games/divisiones/DivisionShell";

import { MoodProvider } from "@/state/mood";
import { ProgressProvider } from "@/state/progress";
import {
  GamificationProvider,
  EscaleraOA1Screen,
  RayosOA2Screen,
  FraccionesOA8Screen,
  SumaFracOA9Screen,
  AcuarioOA10Screen,
  BarrasOA11Screen,
  RelojOA12Screen,
} from "@/app/AppShell";

export default function MathShell() {
  return (
    <ProgressProvider>
      <MoodProvider>
        <GamificationProvider>
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
              <Route path="oa1"  element={<EscaleraRoute />} />
              <Route path="oa2"  element={<RayosRoute />} />
              <Route path="oa3"  element={<ComingSoon title="OA3 · Mercado" />} />
              <Route path="oa8"  element={<FraccionesRoute />} />
              <Route path="oa9"  element={<SumaFracRoute />} />
              <Route path="oa10" element={<AcuarioRoute />} />
              <Route path="oa11" element={<BarrasRoute />} />
              <Route path="oa12" element={<RelojRoute />} />

              {/* Divisiones (nuevo módulo interno) */}
              <Route path="divisiones/*" element={<DivisionShell />} />
            </Routes>
          </div>
        </GamificationProvider>
      </MoodProvider>
    </ProgressProvider>
  );
}

/* Wrappers de retorno al mapa */
function EscaleraRoute()   { const n = useNavigate(); return <EscaleraOA1Screen  onExit={() => n("/math")} />; }
function RayosRoute()      { const n = useNavigate(); return <RayosOA2Screen     onExit={() => n("/math")} />; }
function FraccionesRoute() { const n = useNavigate(); return <FraccionesOA8Screen onExit={() => n("/math")} />; }
function SumaFracRoute()   { const n = useNavigate(); return <SumaFracOA9Screen  onExit={() => n("/math")} />; }
function AcuarioRoute()    { const n = useNavigate(); return <AcuarioOA10Screen  onExit={() => n("/math")} />; }
function BarrasRoute()     { const n = useNavigate(); return <BarrasOA11Screen   onExit={() => n("/math")} />; }
function RelojRoute()      { const n = useNavigate(); return <RelojOA12Screen    onExit={() => n("/math")} />; }

function ComingSoon({ title }: { title: string }) {
  const navigate = useNavigate();
  return (
    <div className="max-w-3xl mx-auto mt-10 text-center space-y-4">
      <h2 className="text-2xl font-bold text-indigo-700">{title}</h2>
      <p className="text-slate-600">Estamos preparando esta actividad para ti. ¡Muy pronto podrás explorarla!</p>
      <Button onClick={() => navigate("/math")} variant="secondary">Volver al mapa</Button>
    </div>
  );
}
