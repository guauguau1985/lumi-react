import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import { modules } from "@/config/modules";

// Gamificación global
import LumiCelebrationOverlay from "@/components/LumiCelebrationOverlay";
import LumiStatusBar from "@/components/LumiStatusBar";

// Supabase
import { supabase } from "@/lib/supabaseClient";

const EcoModule = lazy(() => import("@/modules/eco/EcoShell"));
const MathModule = lazy(() => import("@/modules/math/MathShell"));
const CoderModule = lazy(() => import("@/modules/coder/CoderShell"));

export default function App() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      console.log("sesión:", data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) return <Login />;

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
          {modules.coder && <Route path="/coder/*" element={<CoderModule />} />}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}