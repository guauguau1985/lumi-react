import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import { defaultProfile } from "./defaultProfile";
import { gamificationConfig } from "./config";
import type { GameEvent, GamificationProfile, LessonSessionData, ModuleId } from "./types";
import {
  type StreakState,
  loadStreak,
  saveStreak,
  actualizarRachaHoy,
  syncStreakToSupabase,
} from "./streakStorage";
import {
  loadLeagueLocal,
  markLeagueJoined,
  addXpSemanal,
} from "./leagueStorage";
import { supabase } from "@/shared/lib/supabaseClient";
import { useAuth } from "@/features/auth/AuthContext";

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
  leagueWelcomeVisible: boolean;
  closeLeagueWelcome: () => void;
}

const GamificationContext = createContext<GamificationContextValue | null>(
  null
);

function profileStorageKey(userId?: string | null) {
  return userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY;
}

function loadProfile(userId?: string | null): GamificationProfile {
  try {
    const raw = localStorage.getItem(profileStorageKey(userId));
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
  const { session, profile: accountProfile } = useAuth();
  const [profile, setProfile] = useState<GamificationProfile>(() => loadProfile());
  const [celebration, setCelebration] = useState<CelebrationType>("none");
  const [lessonCompleteVisible, setLessonCompleteVisible] = useState(false);
  const [lastLessonData, setLastLessonData] = useState<LessonSessionData | null>(null);
  const [streak, setStreak] = useState<StreakState>(() => loadStreak());
  const [streakFlowVisible, setStreakFlowVisible] = useState(false);
  const [leagueWelcomeVisible, setLeagueWelcomeVisible] = useState(false);

  // Persistir racha en localStorage cuando cambia
  useEffect(() => {
    saveStreak(streak);
  }, [streak]);

  useEffect(() => {
    if (!session?.user.id || accountProfile?.role !== "student") {
      setProfile(defaultProfile);
      return;
    }

    const userId = session.user.id;
    const local = loadProfile(userId);
    setProfile({ ...local, id: userId, apodo: accountProfile.nombre ?? "Jugador" });

    void supabase
      .from("gamification_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error("[Lumi] gamification profile load error:", error.message);
          return;
        }
        if (!data) return;
        setProfile((current) => ({
          ...current,
          id: userId,
          apodo: accountProfile.nombre ?? current.apodo,
          xpTotal: data.xp_total,
          monedas: data.coins,
          nivel: data.level,
          rachaDias: data.streak_days,
          ultimoIngreso: data.last_active_date,
          insignias: Array.isArray(data.badges)
            ? data.badges.filter((badge): badge is string => typeof badge === "string")
            : current.insignias,
        }));
      });
  }, [session?.user.id, accountProfile?.role, accountProfile?.nombre]);

  useEffect(() => {
    if (!session?.user.id || accountProfile?.role !== "student") return;
    localStorage.setItem(profileStorageKey(session.user.id), JSON.stringify(profile));
  }, [profile, session?.user.id, accountProfile?.role]);

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
    // Mostrar bienvenida a la liga la primera vez
    const leagueLocal = loadLeagueLocal(session?.user.id);
    if (!leagueLocal.joined) {
      setLeagueWelcomeVisible(true);
    }
  };

  const closeLeagueWelcome = () => {
    markLeagueJoined(session?.user.id);
    setLeagueWelcomeVisible(false);
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
    const rule = gamificationConfig[module]?.[gameId]?.[type];
    const xpEarned = rule?.xp ?? 0;
    const coinsEarned = rule?.coins ?? 0;

    setProfile((prev) => {
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

    if (session?.user.id && accountProfile?.role === "student" && (xpEarned > 0 || coinsEarned > 0)) {
      void supabase
        .rpc("add_game_rewards", {
          p_xp: xpEarned,
          p_coins: coinsEarned,
          p_module: module,
        })
        .then(({ data, error }) => {
          if (error) {
            console.error("[Lumi] reward sync error:", error.message);
            return;
          }
          if (!data) return;
          setProfile((current) => ({
            ...current,
            xpTotal: data.xp_total,
            monedas: data.coins,
            nivel: data.level,
            rachaDias: data.streak_days,
            ultimoIngreso: data.last_active_date,
          }));
        });
    }

    // Mostrar LessonComplete al terminar un juego y actualizar liga
    if (type === "GAME_COMPLETED") {
      const xpGanado = xpEarned;
      setLastLessonData({
        ejercicios: (event.payload?.ejercicios as number) ?? 0,
        coinsGanados: xpGanado,
        precision: (event.payload?.accuracy as number) ?? 0,
        modulo: module,
        gameId,
      });
      setLessonCompleteVisible(true);
      // Actualizar XP semanal en la liga
      addXpSemanal(xpGanado, session?.user.id);
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
        leagueWelcomeVisible,
        closeLeagueWelcome,
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
