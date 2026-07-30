import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useGamification } from "@/gamification/GamificationContext";
import { getTrackerSemanal } from "@/gamification/streakStorage";

// ————————————————————————————
// Pantalla 1: Intro de hábito (solo la primera vez)
// ————————————————————————————
function HabitIntro({ onNext }: { onNext: () => void }) {
  return (
    <SlideCard>
      <motion.img
        src="/img/lumi/body.png"
        alt="Lumi"
        className="w-28 h-28 object-contain"
        animate={{ rotate: [-4, 4, -4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <h2 className="text-2xl font-extrabold text-white text-center">
        ¡Creemos un hábito!
      </h2>
      <p className="text-gray-300 text-center text-sm leading-relaxed">
        Ahora te ayudaremos a crear un hábito de aprendizaje.
      </p>
      <button
        onClick={onNext}
        className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 active:scale-95 transition text-white font-bold"
      >
        Continuar
      </button>
    </SlideCard>
  );
}

// ————————————————————————————
// Pantalla 2: Compromiso de días
// ————————————————————————————
const OPCIONES = [
  { dias: 3, label: "3 días", desc: "Empezando" },
  { dias: 5, label: "5 días", desc: "Vas con fuerza" },
  { dias: 7, label: "7 días", desc: "Creando hábito" },
];

function HabitCommit({ onCommit }: { onCommit: (dias: number) => void }) {
  const [seleccion, setSeleccion] = useState<number | null>(null);

  return (
    <SlideCard>
      <motion.span
        className="text-6xl"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        📅
      </motion.span>
      <h2 className="text-xl font-extrabold text-white text-center">
        ¿Cuántos días seguidos vas a aprender?
      </h2>
      <div className="w-full flex flex-col gap-2">
        {OPCIONES.map(({ dias, label, desc }) => (
          <button
            key={dias}
            onClick={() => setSeleccion(dias)}
            className={`w-full py-3 px-4 rounded-2xl border-2 transition font-semibold flex justify-between items-center ${
              seleccion === dias
                ? "border-purple-500 bg-purple-500/20 text-white"
                : "border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-400"
            }`}
          >
            <span>{label}</span>
            <span className="text-sm text-gray-400">{desc}</span>
          </button>
        ))}
      </div>
      <button
        onClick={() => seleccion && onCommit(seleccion)}
        disabled={!seleccion}
        className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition text-white font-bold"
      >
        Comprometerme con mi objetivo
      </button>
    </SlideCard>
  );
}

// ————————————————————————————
// Pantalla 3: Celebración de racha
// ————————————————————————————
function StreakCelebration({ onClose }: { onClose: () => void }) {
  const { streak } = useGamification();
  const { rachaActual, diasMeta, diasActivosSemana, rachaMaxima } = streak;
  const tracker = getTrackerSemanal(diasActivosSemana);
  const diasEnDesafio = Math.min(rachaActual, diasMeta);
  const progresoDesafio = Math.round((diasEnDesafio / diasMeta) * 100);

  return (
    <SlideCard>
      {/* Llama animada con número de racha */}
      <div className="relative flex items-center justify-center">
        <motion.div
          className="text-7xl select-none"
          style={{ filter: "hue-rotate(200deg) saturate(1.5)" }}
          animate={{ scale: [1, 1.08, 1], y: [0, -4, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        >
          🔥
        </motion.div>
        <span className="absolute text-2xl font-extrabold text-white drop-shadow-lg">
          {rachaActual}
        </span>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-white">¡Desafío aceptado!</h2>
        <p className="mt-1 text-sm text-gray-300">
          Crea un hábito de aprendizaje manteniendo tu racha.
        </p>
      </div>

      {/* Tracker semanal */}
      <div className="w-full flex justify-between gap-1">
        {tracker.map(({ label, completado, esHoy, esFuturo, fecha }) => {
          const esMeta = diasMeta <= 7 && tracker.findIndex((d) => d.fecha === fecha) + 1 === diasMeta;
          return (
            <div key={fecha} className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`w-full aspect-square rounded-full flex items-center justify-center text-xs font-bold transition ${
                  completado
                    ? "bg-purple-500 text-white"
                    : esHoy
                    ? "bg-purple-500/30 border-2 border-purple-400 text-white"
                    : esFuturo
                    ? "bg-gray-800 text-gray-600"
                    : "bg-gray-700 text-gray-500"
                }`}
              >
                {completado ? "✓" : esMeta && !completado ? "⭐" : ""}
              </div>
              <span className={`text-[10px] ${esHoy ? "text-purple-400 font-bold" : "text-gray-500"}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tarjeta del desafío */}
      <div className="w-full rounded-2xl bg-gray-800 border border-gray-700 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl" style={{ filter: "hue-rotate(200deg)" }}>🔥</span>
            <span className="text-white font-bold text-sm">Desafío de {diasMeta} días</span>
          </div>
          <span className="text-yellow-400 font-bold text-sm">+200 LumiCoins</span>
        </div>
        <p className="text-gray-400 text-xs">
          DÍA {diasEnDesafio} DE {diasMeta}
          {rachaMaxima > diasMeta && (
            <span className="ml-2 text-purple-400">· Récord: {rachaMaxima}</span>
          )}
        </p>
        <div className="w-full h-2 rounded-full bg-gray-700 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${progresoDesafio}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Botones */}
      <div className="w-full flex flex-col gap-2">
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 active:scale-95 transition text-white font-bold"
        >
          Continuar
        </button>
        <button
          className="text-gray-500 text-sm hover:text-gray-400 transition"
          onClick={onClose}
          aria-label="Compartir progreso"
        >
          Compartir
        </button>
      </div>
    </SlideCard>
  );
}

// ————————————————————————————
// Wrapper animado reutilizable
// ————————————————————————————
function SlideCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ scale: 0.88, opacity: 0, y: 32 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.88, opacity: 0, y: 32 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="w-full max-w-sm rounded-3xl bg-gray-900 border border-gray-700 px-6 py-8 flex flex-col items-center gap-5 shadow-2xl"
    >
      {children}
    </motion.div>
  );
}

// ————————————————————————————
// Componente principal: orquesta el flujo de pasos
// ————————————————————————————
export function StreakFlow() {
  const { streakFlowVisible, streak, configurarHabito, closeStreakFlow } =
    useGamification();

  // Paso actual: 0=HabitIntro, 1=HabitCommit, 2=StreakCelebration
  const [paso, setPaso] = useState(0);

  // Si el hábito ya está configurado, saltar directo a celebración
  const pasoEfectivo = streak.habitoConfigurado ? 2 : paso;

  function handleCommit(dias: number) {
    configurarHabito(dias);
    setPaso(2);
  }

  function handleClose() {
    setPaso(0); // reset para la próxima vez
    closeStreakFlow();
  }

  return (
    <AnimatePresence>
      {streakFlowVisible && (
        <motion.div
          key="streak-flow-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/95 p-4"
        >
          <AnimatePresence mode="wait">
            {pasoEfectivo === 0 && (
              <motion.div key="habit-intro" className="w-full flex justify-center">
                <HabitIntro onNext={() => setPaso(1)} />
              </motion.div>
            )}
            {pasoEfectivo === 1 && (
              <motion.div key="habit-commit" className="w-full flex justify-center">
                <HabitCommit onCommit={handleCommit} />
              </motion.div>
            )}
            {pasoEfectivo === 2 && (
              <motion.div key="streak-celebration" className="w-full flex justify-center">
                <StreakCelebration onClose={handleClose} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
