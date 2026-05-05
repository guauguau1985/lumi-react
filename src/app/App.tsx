import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

import Home from "@/app/routes/Home";
import { modules } from "@/shared/config/modules";

// Gamificación global
import LumiCelebrationOverlay from "@/shared/components/lumi/LumiCelebrationOverlay";
import LumiStatusBar from "@/shared/components/lumi/LumiStatusBar";

const EcoModule = lazy(() => import("@/features/eco/pages/EcoHome"));
const MathModule = lazy(() => import("@/features/math/pages/MathHome"));
const NaturalesModule = lazy(() => import("@/features/math/pages/NaturalesHome"));
const CoderModule = lazy(() => import("@/features/coder/pages/CoderHome"));

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