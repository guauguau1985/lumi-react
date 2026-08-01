import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";

import App from "@/App";
import AppProviders from "@/app/AppShell";
import { AuthProvider } from "@/features/auth/AuthContext";
import { GamificationProvider } from "@/gamification/GamificationContext";
import { LessonComplete } from "@/components/gamification/LessonComplete";
import { StreakFlow } from "@/components/gamification/StreakFlow";
import { LeagueWelcome } from "@/components/gamification/LeagueWelcome";

import "@/shared/styles/index.css";

const rootElement = document.getElementById("root") as HTMLElement;

createRoot(rootElement).render(
  <HashRouter>
    <AuthProvider>
      <GamificationProvider>
        <AppProviders>
          <App />
        </AppProviders>
        <LessonComplete />
        <StreakFlow />
        <LeagueWelcome />
      </GamificationProvider>
    </AuthProvider>
  </HashRouter>
);

// 🔧 Registro del Service Worker para PWA
//
// Importante: solo registrar el SW no basta para que una pestaña ya abierta
// (o una PWA instalada que el niño nunca cierra) reciba código nuevo. El SW
// nuevo se instala y activa en segundo plano, pero el bundle de JS que ya
// está corriendo en memoria sigue siendo el viejo hasta que la página se
// recarga. Sin este listener, un deploy nuevo puede tardar mucho en
// "llegar" a un dispositivo que dejó Lumi abierta — se ve como si el fix
// nunca se hubiera aplicado. Recargamos una sola vez cuando el SW activo
// cambia, para que el usuario siempre termine con el código más reciente.
if ("serviceWorker" in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  window.addEventListener("load", () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;

    navigator.serviceWorker
      .register(swUrl)
      .catch((err) => console.error("Error registrando service worker:", err));
  });
}
