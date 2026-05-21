import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useGamification } from "@/gamification/GamificationContext";
import { supabase } from "@/shared/lib/supabaseClient";
import { getDeviceId } from "@/shared/lib/deviceId";

const META_DIARIA = 200;

function subtituloPorPrecision(precision: number): string {
  if (precision === 100) return "¡Perfecto! ¡Eres increíble! 🌟";
  if (precision >= 80)  return "¡Muy bien! ¡Casi perfecto! ⭐";
  if (precision >= 60)  return "¡Buen trabajo! ¡Sigue practicando! 💪";
  return "¡Lo lograste! ¡La práctica hace al maestro! 🎯";
}

function guardarSesion(data: {
  modulo: string;
  gameId: string;
  ejercicios: number;
  xpGanado: number;
  precision: number;
}) {
  void supabase.from("lesson_sessions").insert({
    device_id: getDeviceId(),
    modulo: data.modulo,
    game_id: data.gameId,
    ejercicios: data.ejercicios,
    xp_ganado: data.xpGanado,
    coins_ganados: data.xpGanado,
    precision: data.precision,
  }).then(({ error }) => {
    if (error) console.error("[Lumi] lesson_sessions insert error:", error.message);
  });
}

export function LessonComplete() {
  const { lessonCompleteVisible, lastLessonData, closeLessonComplete, profile } =
    useGamification();

  useEffect(() => {
    if (lessonCompleteVisible && lastLessonData) {
      guardarSesion({
        modulo: lastLessonData.modulo,
        gameId: lastLessonData.gameId,
        ejercicios: lastLessonData.ejercicios,
        xpGanado: lastLessonData.coinsGanados,
        precision: lastLessonData.precision,
      });
    }
  }, [lessonCompleteVisible, lastLessonData]);

  const ejercicios = lastLessonData?.ejercicios ?? 0;
  const coins     = lastLessonData?.coinsGanados ?? 0;
  const precision = lastLessonData?.precision ?? 0;
  const xpHoy     = profile.xpHoy ?? 0;
  const progreso  = Math.min(100, Math.round((xpHoy / META_DIARIA) * 100));

  return (
    <AnimatePresence>
      {lessonCompleteVisible && (
        <motion.div
          key="lesson-complete-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/95 p-4"
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 32 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 32 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="w-full max-w-sm rounded-3xl bg-gray-900 border border-gray-700 px-6 py-8 flex flex-col items-center gap-5 shadow-2xl"
          >
            {/* Robot Lumi con animación de celebración */}
            <motion.img
              src="/img/lumi/feliz.png"
              alt="Lumi feliz"
              className="w-24 h-24 object-contain"
              animate={{ y: [0, -10, 0, -6, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Título */}
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-white">
                ¡Lección completada!
              </h2>
              <p className="mt-1 text-sm text-gray-300">
                {subtituloPorPrecision(precision)}
              </p>
            </div>

            {/* Métricas */}
            <div className="w-full grid grid-cols-3 gap-2">
              <MetricCard icon="📋" value={String(ejercicios)} label="Ejercicios" />
              <MetricCard icon="⚡" value={`+${coins}`} label="LumiCoins" highlight />
              <MetricCard icon="🎯" value={`${precision}%`} label="Precisión" />
            </div>

            {/* Objetivo diario */}
            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span className="font-semibold text-white">Objetivo diario</span>
                <span>{xpHoy} / {META_DIARIA} LumiCoins</span>
              </div>
              <div className="w-full h-3 rounded-full bg-gray-800 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #06b6d4, #22c55e)",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progreso}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Botón Continuar */}
            <button
              onClick={closeLessonComplete}
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 active:scale-95 transition text-white font-bold text-base shadow-lg"
            >
              Continuar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MetricCard({
  icon,
  value,
  label,
  highlight = false,
}: {
  icon: string;
  value: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-1 rounded-2xl py-3 px-2 ${
        highlight ? "bg-yellow-500/20 border border-yellow-500/40" : "bg-gray-800"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span
        className={`text-lg font-extrabold ${
          highlight ? "text-yellow-400" : "text-white"
        }`}
      >
        {value}
      </span>
      <span className="text-[10px] text-gray-400 text-center leading-tight">
        {label}
      </span>
    </div>
  );
}
