import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

import Home from "@/pages/Home";
import { modules } from "@/config/modules";

// Gamificación global
import LumiCelebrationOverlay from "@/components/LumiCelebrationOverlay";
import LumiStatusBar from "@/components/LumiStatusBar";

const EcoModule = lazy(() => import("@/modules/eco/EcoShell"));
const MathModule = lazy(() => import("@/modules/math/MathShell"));
const NaturalesModule = lazy(() => import("@/modules/naturales/NaturalesShell"));
const CoderModule = lazy(() => import("@/modules/coder/CoderShell"));

export default function App() {
  return (
    <>
      {/* 🎉 Confeti global */}
      <LumiCelebrationOverlay />

      {/* 💚 Barra global de nivel/XP/monedas */}
      <LumiStatusBar />

      {/* 📌 Rutas principales */}
      <Suspense fallback={<div className="p-6">Cargando…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />

          {modules.eco && <Route path="/eco/*" element={<EcoModule />} />}
          {modules.math && <Route path="/math/*" element={<MathModule />} />}
          {modules.naturales && (
            <Route path="/naturales/*" element={<NaturalesModule />} />
          )}
          {modules.coder && <Route path="/coder/*" element={<CoderModule />} />}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}