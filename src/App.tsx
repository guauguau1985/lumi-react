// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import Home from "@/pages/Home";
import AtrapaError from "@/pages/AtrapaError";
import { modules } from "@/config/modules";

const EcoModule   = lazy(() => import("@/modules/eco/EcoShell"));
const MathModule  = lazy(() => import("@/modules/math/MathShell"));
const CoderModule = lazy(() => import("@/modules/coder/CoderShell"));

export default function App() {
  return (
    <Suspense fallback={<div className="p-6">Cargando…</div>}>
      <Routes>
        <Route path="/" element={<Home />} />

        {modules.eco   && <Route path="/eco/*"   element={<EcoModule />} />}
        {modules.math  && <Route path="/math/*"  element={<MathModule />} />}
        {modules.coder && <Route path="/coder/*" element={<CoderModule />} />}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
