import React from "react";
import { useGamification } from "../gamification/GamificationContext";

const LumiStatusBar: React.FC = () => {
  const { profile } = useGamification();

  const xpNivelActual = (profile.nivel - 1) * 100;
  const xpSiguiente = profile.nivel * 100;
  const progreso =
    ((profile.xpTotal - xpNivelActual) / (xpSiguiente - xpNivelActual || 1)) *
    100;

  return (
    <header className="sticky top-0 z-40 mb-3 bg-emerald-900/95 text-emerald-50 shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2 text-xs md:text-sm">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 overflow-hidden rounded-2xl bg-emerald-300/90">
            <img
              src="/img/Lumi_feliz.png"
              alt="Lumi"
              className="h-full w-full object-contain"
            />
          </div>  
          <div>
            <p className="font-semibold leading-tight">
              Lumi nivel {profile.nivel}
            </p>
            <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-emerald-950/40 md:w-40">
              <div
                className="h-full rounded-full bg-emerald-300"
                style={{ width: `${Math.min(Math.max(progreso, 0), 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 text-[11px] md:text-xs">
          <span>
            XP: <strong>{profile.xpTotal}</strong>
          </span>
          <span>
            Hojas: <strong>{profile.monedas}</strong>
          </span>
          <span>
            Racha:{" "}
            <strong>
              {profile.rachaDias} día{profile.rachaDias === 1 ? "" : "s"}
            </strong>
          </span>
        </div>
      </div>
    </header>
  );
};

export default LumiStatusBar;
