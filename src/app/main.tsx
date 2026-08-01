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
// recarga.
//
// OJO: NO recargamos apenas cambia el SW activo. Todo el estado de "Ayúdame
// con mi tarea" (tarea cargada, chat, adjuntos) vive solo en memoria de
// React; un reload en medio de la conversación borraría todo sin avisar,
// justo cuando el niño está usando la app. En vez de eso, guardamos la señal
// de que hay una versión nueva y recargamos recién cuando la pestaña deja de
// estar visible (el niño cambió de app o apagó la pantalla) — un momento en
// que no hay nada que perder. La próxima vez que vuelva a mirar Lumi, ya
// tendrá el código actualizado.
if ("serviceWorker" in navigator) {
  let refreshing = false;
  let updateReady = false;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    updateReady = true;
  });

  document.addEventListener("visibilitychange", () => {
    if (updateReady && document.visibilityState === "hidden" && !refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });

  window.addEventListener("load", () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;

    navigator.serviceWorker
      .register(swUrl)
      .catch((err) => console.error("Error registrando service worker:", err));
  });
}
