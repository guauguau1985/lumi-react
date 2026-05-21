import { supabase } from "@/shared/lib/supabaseClient";
import { getDeviceId } from "@/shared/lib/deviceId";

const STORAGE_KEY = "lumi-streak-v1";

export interface StreakState {
  rachaActual: number;
  rachaMaxima: number;
  ultimoDiaActivo: string | null; // "YYYY-MM-DD"
  diasMeta: number;               // 3, 5 o 7
  freezeDisponibles: number;
  habitoConfigurado: boolean;
  diasActivosSemana: string[];    // fechas "YYYY-MM-DD" de esta semana
}

export const defaultStreak: StreakState = {
  rachaActual: 0,
  rachaMaxima: 0,
  ultimoDiaActivo: null,
  diasMeta: 5,
  freezeDisponibles: 1,
  habitoConfigurado: false,
  diasActivosSemana: [],
};

export function loadStreak(): StreakState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStreak;
    return { ...defaultStreak, ...(JSON.parse(raw) as StreakState) };
  } catch {
    return defaultStreak;
  }
}

export function saveStreak(s: StreakState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getLunesDeEstaSemana(): string {
  const hoy = new Date();
  const dow = hoy.getDay(); // 0=Dom
  const diff = dow === 0 ? -6 : 1 - dow;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + diff);
  return isoDate(lunes);
}

export function actualizarRachaHoy(prev: StreakState): StreakState {
  const hoy = isoDate(new Date());
  if (prev.ultimoDiaActivo === hoy) return prev; // ya registrado hoy

  let nuevaRacha = 1;
  if (prev.ultimoDiaActivo) {
    const dAyer = new Date(prev.ultimoDiaActivo);
    dAyer.setDate(dAyer.getDate() + 1);
    if (isoDate(dAyer) === hoy) {
      nuevaRacha = prev.rachaActual + 1;
    }
    // si pasaron más días: racha se rompe (queda en 1)
  }

  // Días activos de esta semana (solo a partir del lunes)
  const lunes = getLunesDeEstaSemana();
  const activos = prev.diasActivosSemana.filter((d) => d >= lunes);
  if (!activos.includes(hoy)) activos.push(hoy);

  return {
    ...prev,
    rachaActual: nuevaRacha,
    rachaMaxima: Math.max(prev.rachaMaxima, nuevaRacha),
    ultimoDiaActivo: hoy,
    diasActivosSemana: activos,
  };
}

export function syncStreakToSupabase(streak: StreakState): void {
  void supabase
    .from("user_streaks")
    .upsert(
      {
        device_id: getDeviceId(),
        racha_actual: streak.rachaActual,
        racha_maxima: streak.rachaMaxima,
        ultimo_dia_activo: streak.ultimoDiaActivo,
        dias_meta: streak.diasMeta,
        freeze_disponibles: streak.freezeDisponibles,
        habito_configurado: streak.habitoConfigurado,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "device_id" }
    )
    .then(({ error }) => {
      if (error) console.error("[Lumi] user_streaks upsert error:", error.message);
    });
}

/** Retorna los 7 días de la semana actual con su estado para el tracker visual */
export function getTrackerSemanal(
  diasActivosSemana: string[]
): Array<{
  label: string;
  fecha: string;
  completado: boolean;
  esHoy: boolean;
  esFuturo: boolean;
}> {
  const hoy = new Date();
  const hoyStr = isoDate(hoy);
  const dow = hoy.getDay(); // 0=Dom
  const diffLunes = dow === 0 ? -6 : 1 - dow;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + diffLunes);

  const labels = ["L", "M", "X", "J", "V", "S", "D"];
  return labels.map((label, i) => {
    const d = new Date(lunes);
    d.setDate(lunes.getDate() + i);
    const fecha = isoDate(d);
    return {
      label,
      fecha,
      completado: diasActivosSemana.includes(fecha),
      esHoy: fecha === hoyStr,
      esFuturo: fecha > hoyStr,
    };
  });
}
