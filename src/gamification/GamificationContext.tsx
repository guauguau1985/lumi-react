import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { defaultProfile } from "./defaultProfile";
import { gamificationConfig } from "./config";
import type { GameEvent, GamificationProfile, LessonSessionData, ModuleId } from "./types";
import {
  type StreakState,
  defaultStreak,
  loadStreak,
  saveStreak,
  actualizarRachaHoy,
  syncStreakToSupabase,
} from "./streakStorage";

const STORAGE_KEY = "lumi-gamification-profile-v1";

type CelebrationType = "none" | "small" | "big";

interface GamificationContextValue {
  profile: GamificationProfile;
  dispatchEvent: (event: GameEvent) => void;
  registrarIngresoHoy: () => void;
  celebration: CelebrationType;
  clearCelebration: () => void;
  lessonCompleteVisible: boolean;
  lastLessonData: LessonSessionData | null;
  closeLessonComplete: () => void;
  streak: StreakState;
  streakFlowVisible: boolean;
  closeStreakFlow: () => void;
  configurarHabito: (dias: number) => void;
}

const GamificationContext = createContext<GamificationContextValue | null>(
  null
);

function loadProfile(): GamificationProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile;
    const parsed = JSON.parse(raw) as GamificationProfile;
    return {
      ...defaultProfile,
      ...parsed,
      modulos: {
        ...defaultProfile.modulos,
        ...parsed.modulos,
      },
    };
  } catch {
    return defaultProfile;
  }
}

function calcularNivel(xpTotal: number): number {
  return Math.floor(xpTotal / 100) + 1;
}

function sumarDias(fechaISO: string, dias: number): string {
  const [y, m, d] = fechaISO.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + dias);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<GamificationProfile>(() => loadProfile());
  const [celebration, setCelebration] = useState<CelebrationType>("none");
  const [lessonCompleteVisible, setLessonCompleteVisible] = useState(false);
  const [lastLessonData, setLastLessonData] = useState<LessonSessionData | null>(null);
  const [streak, setStreak] = useState<StreakState>(() => loadStreak());
  const [streakFlowVisible, setStreakFlowVisible] = useState(false);

  // Persistir racha en localStorage cuando cambia
  useEffect(() => {
    saveStreak(streak);
  }, [streak]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const registrarIngresoHoy = () => {
    const hoy = new Date().toISOString().slice(0, 10);
    setProfile((prev) => {
      if (prev.ultimoIngreso === hoy) return prev;

      let nuevaRacha = 1;
      if (prev.ultimoIngreso) {
        const ayer = sumarDias(hoy, -1);
        if (prev.ultimoIngreso === ayer) {
          nuevaRacha = (prev.rachaDias || 0) + 1;
        }
      }

      return {
        ...prev,
        ultimoIngreso: hoy,
        rachaDias: nuevaRacha,
      };
    });
  };

  const triggerCelebration = (type: CelebrationType) => {
    setCelebration(type);
  };

  const clearCelebration = () => {
    setCelebration("none");
  };

  const closeLessonComplete = () => {
    setLessonCompleteVisible(false);
    // Actualizar racha y mostrar el flujo de racha
    setStreak((prev) => {
      const updated = actualizarRachaHoy(prev);
      syncStreakToSupabase(updated);
      return updated;
    });
    setStreakFlowVisible(true);
  };

  const closeStreakFlow = () => {
    setStreakFlowVisible(false);
  };

  const configurarHabito = (dias: number) => {
    setStreak((prev) => {
      const updated = { ...prev, diasMeta: dias, habitoConfigurado: true };
      syncStreakToSupabase(updated);
      return updated;
    });
  };

  const dispatchEvent = (event: GameEvent) => {
    const { module, gameId, type } = event;

    setProfile((prev) => {
      const rulesForModule = gamificationConfig[module];
      const rulesForGame = rulesForModule?.[gameId];
      const rule = rulesForGame?.[type];

      const xpEarned = rule?.xp ?? 0;
      const coinsEarned = rule?.coins ?? 0;

      const newXpTotal = prev.xpTotal + xpEarned;
      const prevLevel = prev.nivel;
      const newLevel = calcularNivel(newXpTotal);
      const leveledUp = newLevel > prevLevel;

      const prevModule = prev.modulos[module as ModuleId] || {};
      const moduleProgress = {
        ...prevModule,
        xp: (prevModule.xp || 0) + xpEarned,
        gamesPlayed: (prevModule.gamesPlayed || 0) + 1,
        gamesCompleted:
          type === "GAME_COMPLETED"
            ? (prevModule.gamesCompleted || 0) + 1
            : prevModule.gamesCompleted || 0,
      };

      let nuevasInsignias = [...prev.insignias];
      let ganoInsignia = false;
      if (rule?.badge && !nuevasInsignias.includes(rule.badge)) {
        nuevasInsignias.push(rule.badge);
        ganoInsignia = true;
      }

      // Tracking XP diario (resetea si cambió el día)
      const today = new Date().toISOString().slice(0, 10);
      const newXpHoy =
        prev.fechaXpHoy === today ? prev.xpHoy + xpEarned : xpEarned;

      // Celebraciones para eventos que NO son GAME_COMPLETED
      // (GAME_COMPLETED muestra LessonComplete en su lugar)
      if (type !== "GAME_COMPLETED") {
        if (ganoInsignia || leveledUp) {
          triggerCelebration("big");
        } else if (type === "CORRECT_ANSWER" && xpEarned > 0) {
          triggerCelebration("small");
        }
      }

      return {
        ...prev,
        xpTotal: newXpTotal,
        nivel: newLevel,
        monedas: prev.monedas + coinsEarned,
        insignias: nuevasInsignias,
        xpHoy: newXpHoy,
        fechaXpHoy: today,
        modulos: {
          ...prev.modulos,
          [module]: moduleProgress,
        },
      };
    });

    // Mostrar LessonComplete al terminar un juego
    if (type === "GAME_COMPLETED") {
      const rule = gamificationConfig[module]?.[gameId]?.[type];
      const xpGanado = rule?.xp ?? 0;
      setLastLessonData({
        ejercicios: (event.payload?.ejercicios as number) ?? 0,
        coinsGanados: xpGanado,
        precision: (event.payload?.accuracy as number) ?? 0,
        modulo: module,
        gameId,
      });
      setLessonCompleteVisible(true);
    }
  };

  return (
    <GamificationContext.Provider
      value={{
        profile,
        dispatchEvent,
        registrarIngresoHoy,
        celebration,
        clearCelebration,
        lessonCompleteVisible,
        lastLessonData,
        closeLessonComplete,
        streak,
        streakFlowVisible,
        closeStreakFlow,
        configurarHabito,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const ctx = useContext(GamificationContext);
  if (!ctx) {
    throw new Error(
      "useGamification debe usarse dentro de <GamificationProvider>"
    );
  }
  return ctx;
}
