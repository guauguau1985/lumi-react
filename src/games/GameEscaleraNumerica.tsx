import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// =============================================
// GameEscaleraNumerica – OA1 (4° básico)
// Conteo y orden hasta 10.000: 1/10/100/1000
// =============================================

export type StepUnit = 1 | 10 | 100 | 1000;

const STEPS: { label: string; value: StepUnit }[] = [
  { label: "1 en 1", value: 1 },
  { label: "10 en 10", value: 10 },
  { label: "100 en 100", value: 100 },
  { label: "1000 en 1000", value: 1000 },
];

const WORLD_LIMIT = 10000;

// ---------- helpers ----------
function clamp(n: number, min = 0, max = WORLD_LIMIT) {
  return Math.min(Math.max(n, min), max);
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- UI atoms ----------
const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={`rounded-2xl shadow-lg p-5 bg-white/80 backdrop-blur ${className ?? ""}`}>{children}</div>
);

const Btn: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "success" | "danger";
  disabled?: boolean;
}> = ({ children, onClick, variant = "primary", disabled }) => {
  const cls =
    "px-4 py-2 rounded-xl text-sm font-semibold transition active:scale-[.98] focus:outline-none focus:ring-2 ";
  let theme =
    variant === "primary"
      ? "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-400 disabled:opacity-50"
      : variant === "success"
      ? "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-400"
      : variant === "danger"
      ? "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-400"
      : "bg-transparent text-emerald-700 hover:bg-emerald-50 focus:ring-emerald-300";

  return (
    <button onClick={onClick} disabled={disabled} className={cls + theme}>
      {children}
    </button>
  );
};

const Platform: React.FC<{ value: number; active?: boolean }> = ({ value, active }) => (
  <motion.div
    layout
    className={`flex items-center justify-center w-16 h-12 rounded-2xl border text-lg font-bold shadow-sm ${
      active ? "bg-emerald-100 border-emerald-300 text-emerald-800" : "bg-white border-slate-200 text-slate-700"
    }`}
  >
    {value}
  </motion.div>
);

// Mini confetti simple (sin librerías externas)
const MiniConfetti: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null;
  const pieces = Array.from({ length: 60 });
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {pieces.map((_, i) => (
        <motion.span
          key={i}
          className="absolute block h-2 w-2 rounded-sm"
          style={{
            left: `${randInt(0, 100)}%`,
            top: -8,
            background: `hsl(${randInt(0, 360)},80%,60%)`,
          }}
          initial={{ y: -10, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", rotate: randInt(90, 360) }}
          transition={{ duration: randInt(8, 14) / 10, ease: "easeOut" }}
        />
      ))}
    </div>
  );
};

// ---------- Componente principal ----------
const GameEscaleraNumerica: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState<StepUnit>(10);
  const [length, setLength] = useState(8);
  const [start, setStart] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [modeNeighbors, setModeNeighbors] = useState(false);
  const [levelDone, setLevelDone] = useState(false);
  const [options, setOptions] = useState<number[]>([]);
  const [target, setTarget] = useState<number>(0);
  const [sequence, setSequence] = useState<number[]>([]);

  const maxStart = useMemo(() => WORLD_LIMIT - step * length, [step, length]);

  // Setup de secuencia
  useEffect(() => {
    const s = clamp(start, 0, maxStart);
    const seq = Array.from({ length: length + 1 }, (_, i) => s + i * step);
    setSequence(seq);
    setCurrentIndex(0);
    setLives(3);
    setScore(0);
    setLevelDone(false);
  }, [step, length, start, maxStart]);

  // Generar opciones por paso
  useEffect(() => {
    if (!sequence.length) return;
    if (currentIndex >= length) {
      setLevelDone(true);
      setOptions([]);
      return;
    }
    const base = sequence[currentIndex];
    const correct = modeNeighbors ? (randInt(0, 1) ? base - step : base + step) : base + step;

    const distractors = new Set<number>();
    while (distractors.size < 2) {
      const delta = randInt(-3, 3) * step || step * randInt(2, 3);
      const candidate = clamp(base + delta);
      if (candidate !== correct && candidate !== base) distractors.add(candidate);
    }
    setTarget(correct);
    setOptions(shuffle([correct, ...Array.from(distractors)]).slice(0, 3));
  }, [currentIndex, sequence, step, modeNeighbors, length]);

  function handleAnswer(n: number) {
    if (levelDone) return;
    if (n === target) {
      setCurrentIndex((i) => i + 1);
      setScore((s) => s + 10);
    } else {
      setLives((h) => Math.max(0, h - 1));
    }
  }

  useEffect(() => {
    if (lives === 0) setLevelDone(true);
  }, [lives]);

  useEffect(() => {
    if (levelDone) setBest((b) => Math.max(b, score));
  }, [levelDone, score]);

  useEffect(() => {
    if (levelDone && lives > 0) onComplete?.(score);
  }, [levelDone, lives, score, onComplete]);

  const progress = Math.min(100, Math.round((currentIndex / length) * 100));

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-emerald-50 to-sky-50 p-4 md:p-8">
      <MiniConfetti show={levelDone && lives > 0} />

      {/* Header */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-800 tracking-tight">
            Escalera numérica · OA1
          </h1>
          <p className="text-slate-600 mt-1">
            Avanza de {step} en {step} hasta {WORLD_LIMIT}. Practica conteo y números vecinos.
          </p>
        </div>
        <Card className="flex items-center gap-4">
          <div className="text-sm text-slate-600">Vidas</div>
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={`h-3 w-6 rounded-full ${i < lives ? "bg-rose-500" : "bg-slate-200"}`} />
            ))}
          </div>
          <div className="w-px h-6 bg-slate-200" />
          <div className="text-sm text-slate-600">Puntaje</div>
          <div className="font-bold text-slate-800">{score}</div>
          <div className="text-xs text-slate-400">(mejor: {best})</div>
        </Card>
      </div>

      {/* Controles */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-4 mt-6">
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-semibold text-slate-700">Paso</label>
            <div className="flex flex-wrap gap-2">
              {STEPS.map((s) => (
                <Btn key={s.value} onClick={() => setStep(s.value)} variant={step === s.value ? "success" : "ghost"}>
                  {s.label}
                </Btn>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="text-sm font-semibold text-slate-700">Peldaños</label>
            <input
              type="range"
              min={5}
              max={12}
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-40"
            />
            <span className="text-slate-700 font-semibold">{length}</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="text-sm font-semibold text-slate-700">Inicio</label>
            <input
              type="number"
              min={0}
              max={maxStart}
              value={start}
              onChange={(e) => setStart(clamp(parseInt(e.target.value || "0"), 0, maxStart))}
              className="w-28 rounded-lg border px-3 py-1.5"
            />
            <span className="text-xs text-slate-500">máx. {maxStart}</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <input
              id="vecinos"
              type="checkbox"
              className="h-4 w-4"
              checked={modeNeighbors}
              onChange={(e) => setModeNeighbors(e.target.checked)}
            />
            <label htmlFor="vecinos" className="text-sm text-slate-700">
              Modo vecinos (anterior/siguiente)
            </label>
          </div>
        </Card>

        <Card>
          <div className="flex flex-wrap gap-2">
            <Btn onClick={() => setStart(start)} variant="primary">Reiniciar</Btn>
            <Btn onClick={() => setStart(randInt(0, Math.max(0, WORLD_LIMIT - step * length)))} variant="ghost">
              Nuevo inicio aleatorio
            </Btn>
          </div>
          <div className="mt-4">
            <div className="text-sm text-slate-600 mb-1">Progreso</div>
            <div className="h-3 w-full rounded-full bg-slate-100">
              <div className="h-3 rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Sugerencia: usa inicios múltiplos del paso para reforzar patrones (ej. 240, 480…)
          </p>
        </Card>
      </div>

      {/* Escalera y pregunta */}
      <div className="max-w-5xl mx-auto mt-8 grid place-items-center">
        <Card className="w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 place-items-center">
            {sequence.slice(0, currentIndex + 1).map((v, i) => (
              <Platform key={`${v}-${i}`} value={v} active={i === currentIndex} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {!levelDone ? (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6"
              >
                <div className="text-center text-lg font-semibold text-slate-700">
                  {modeNeighbors ? (
                    <>
                      ¿Cuál es el <span className="text-emerald-700">vecino</span> de{" "}
                      <span className="underline">{sequence[currentIndex]}</span> en pasos de {step}?
                    </>
                  ) : (
                    <>
                      ¿Qué número viene después de{" "}
                      <span className="underline">{sequence[currentIndex]}</span> si contamos de {step} en {step}?
                    </>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  {options.map((opt) => (
                    <Btn key={opt} onClick={() => handleAnswer(opt)} variant="ghost">
                      {opt}
                    </Btn>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 text-center">
                <div className="text-2xl font-extrabold text-emerald-700">
                  {lives > 0 ? "¡Nivel completado!" : "Fin del nivel"}
                </div>
                <p className="text-slate-600 mt-1">Puntaje: {score}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
};

export default GameEscaleraNumerica;
