import React, { useEffect, useMemo, useState } from "react";
import Feedback from "@/components/Feedback";
import { useFeedback } from "@/hooks/useFeedback";
// =============================================
// GameFraccionesPizza – OA8 (4° básico)
// Representar fracciones (unitarias y propias) como parte-todo en círculos/cuadrículas.
// Modos: 1) Colorear la fracción dada; 2) Leer la fracción coloreada; 3) Marcar fracción equivalente simple.
// onComplete(score) para gamificación externa.
// =============================================

type Mode = "paint" | "read" | "equiv";

type PieSpec = { parts: number; filled: number };

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }
function simplify(n: number, d: number) { const g = gcd(n, d); return { n: n / g, d: d / g }; }

const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={`rounded-2xl shadow-lg p-5 bg-white/80 backdrop-blur ${className ?? ""}`}>{children}</div>
);

const Btn: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "success" | "danger";
  disabled?: boolean;
}> = ({ children, onClick, variant = "primary", disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={
      "px-4 py-2 rounded-xl text-sm font-semibold transition active:scale-[.98] focus:outline-none focus:ring-2 " +
      (variant === "primary"
        ? "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-400 disabled:opacity-50"
        : variant === "success"
        ? "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-400"
        : variant === "danger"
        ? "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-400"
        : "bg-transparent text-emerald-700 hover:bg-emerald-50 focus:ring-emerald-300")
    }
  >
    {children}
  </button>
);

const FractionLabel: React.FC<{ n: number; d: number }> = ({ n, d }) => (
  <div className="inline-flex flex-col items-center leading-none">
    <span className="text-2xl font-bold text-slate-800">{n}</span>
    <span className="w-full h-px bg-slate-400 my-0.5" />
    <span className="text-2xl font-bold text-slate-800">{d}</span>
  </div>
);

const Pizza: React.FC<{
  spec: PieSpec;
  onToggle?: (i: number) => void;
  editable?: boolean;
}> = ({ spec, onToggle, editable }) => {
  const { parts, filled } = spec;
  const wedges = Array.from({ length: parts }, (_, i) => i);
  return (
    <svg viewBox="-50 -50 100 100" className="w-56 h-56 select-none">
      {wedges.map((i) => {
        const a0 = (i / parts) * 2 * Math.PI;
        const a1 = ((i + 1) / parts) * 2 * Math.PI;
        const x0 = 0, y0 = 0;
        const x1 = 40 * Math.cos(a0), y1 = 40 * Math.sin(a0);
        const x2 = 40 * Math.cos(a1), y2 = 40 * Math.sin(a1);
        const filledHere = i < filled;
        return (
          <g
            key={i}
            onClick={() => editable && onToggle?.(i)}
            className={editable ? "cursor-pointer" : ""}
          >
            <path
              d={`M ${x0} ${y0} L ${x1} ${y1} A 40 40 0 0 1 ${x2} ${y2} Z`}
              fill={filledHere ? "#10b981" : "#f1f5f9"}
              stroke="#94a3b8"
            />
          </g>
        );
      })}
      <circle r={41} fill="none" stroke="#e2e8f0" />
    </svg>
  );
};


const GameFraccionesPizza: React.FC<{
  onComplete?: (score: number) => void;  
  onRight?: () => void;                       //Extender Props
  onWrong?: () => void;                       //Extender Props
}> = ({ onComplete, onRight, onWrong }) => {
  const [mode, setMode] = useState<Mode>("paint");
  const [parts, setParts] = useState(4);
  const [filled, setFilled] = useState(1);
  const [goal, setGoal] = useState<{ n: number; d: number }>({ n: 1, d: 2 });
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [done, setDone] = useState(false);

  function newRound(m = mode) {
    if (m === "paint") {
      const d = [2, 3, 4, 5, 6, 8, 10, 12][randInt(0, 7)];
      const n = randInt(1, Math.max(1, Math.floor(d * 0.75)));
      setParts(d);
      setFilled(0);
      setGoal({ n, d });
    } else if (m === "read") {
      const d = [2, 3, 4, 5, 6, 8, 10, 12][randInt(0, 7)];
      const n = randInt(1, Math.max(1, Math.floor(d * 0.75)));
      setParts(d);
      setFilled(n);
      setGoal({ n, d });
    } else {
      const d = [2,4,6,8,10,12][randInt(0,5)];
      const n = randInt(1, d - 1);
      const simp = simplify(n, d);
      setParts(d);
      setFilled(n);
      setGoal({ n: simp.n, d: simp.d });
    }
  }

  useEffect(() => { newRound("paint"); }, []);
  useEffect(() => { if (lives === 0) setDone(true); }, [lives]);
  useEffect(() => { if (done) onComplete?.(score); }, [done, score, onComplete]);

  // Feedback hook reutilizable
  const { feedback, markCorrect, markWrong, clear } = useFeedback();

  const spec = useMemo(() => ({ parts, filled }), [parts, filled]);

  const isCorrect = useMemo(() => {
    if (mode === "paint") return filled === goal.n && parts === goal.d;
    if (mode === "read") return true; // se evalúa aparte
    const simp = simplify(filled, parts);
    return simp.n === goal.n && simp.d === goal.d;
  }, [mode, filled, parts, goal]);

  function toggle(i: number) {
    setFilled((f) => (i < parts ? Math.max(0, Math.min(parts, i + 1)) : f));
  }

  function answerRead(n: number, d: number) {
    const ok = n === goal.n && d === goal.d;
    settle(ok);
  }

  function settle(correct: boolean) {
    if (correct) {
      onRight?.();
      markCorrect(); // muestra feedback positivo y limpia luego
      const s = streak + 1;
      setStreak(s);
      setScore((x) => x + 10 + Math.max(0, s - 1) * 2);
      newRound(mode);
    } else {
      onWrong?.();
      markWrong(); // muestra feedback de error y limpia luego
      setStreak(0);
      setLives((h) => Math.max(0, h - 1));
    }
  }

  function resetAll() {
    clear();
    setMode("paint");
    setLives(3);
    setScore(0);
    setStreak(0);
    newRound("paint");
    setDone(false);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-pink-50 to-emerald-50 p-4 md:p-8">
  <Feedback state={feedback} successText="¡Bien hecho!" errorText="Casi, intenta otra vez" />
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-800">Pizza de Fracciones · OA8</h1>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="px-3 py-1 rounded-full bg-white/80 shadow">Vidas {"❤️".repeat(lives)}{"🤍".repeat(3-lives)}</span>
          <span className="px-3 py-1 rounded-full bg-white/80 shadow">Racha {streak}</span>
          <span className="px-3 py-1 rounded-full bg-white/80 shadow font-bold">Puntaje {score}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-4 mt-6">
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Modo</span>
            <Btn variant={mode === "paint" ? "success" : "ghost"} onClick={() => { clear(); setMode("paint"); newRound("paint"); }}>Colorear</Btn>
            <Btn variant={mode === "read" ? "success" : "ghost"} onClick={() => { clear(); setMode("read"); newRound("read"); }}>Leer</Btn>
            <Btn variant={mode === "equiv" ? "success" : "ghost"} onClick={() => { clear(); setMode("equiv"); newRound("equiv"); }}>Equivalentes</Btn>
          </div>
          <div className="mt-3 text-sm text-slate-600">
            {mode === "paint" && <span>Colorea <b>{goal.n}/{goal.d}</b> de la pizza.</span>}
            {mode === "read" && <span>¿Qué fracción está coloreada?</span>}
            {mode === "equiv" && <span>Marca una fracción <b>equivalente</b> a la mostrada.</span>}
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">Objetivo</div>
            <FractionLabel n={goal.n} d={goal.d} />
            <Btn onClick={() => { clear(); newRound(mode); }} variant="ghost">Nueva</Btn>
          </div>
        </Card>
      </div>

      <div className="max-w-5xl mx-auto mt-6 grid md:grid-cols-2 gap-4 place-items-center">
        <Card className="flex items-center justify-center">
          <Pizza spec={spec} editable={mode !== "read"} onToggle={toggle} />
        </Card>

        <Card>
          {mode === "paint" && (
            <div className="text-center">
              <div className="text-sm mb-2 text-slate-600">Coloreado actual</div>
              <FractionLabel n={filled} d={parts} />
              <div className="mt-4"><Btn onClick={() => settle(isCorrect)} variant="primary">Comprobar</Btn></div>
            </div>
          )}
          {mode === "read" && (
            <div className="text-center">
              <div className="text-sm mb-2 text-slate-600">Ingresa numerador/denominador</div>
              <div className="flex items-center justify-center gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <input className="w-16 rounded border px-2 py-1" type="number" min={0} max={parts} defaultValue={filled} id="nval" />
                    <span className="text-slate-400">/</span>
                    <input className="w-16 rounded border px-2 py-1" type="number" min={1} max={24} defaultValue={parts} id="dval" />
                  </div>
                  <Btn onClick={() => {
                    const nv = Number((document.getElementById("nval") as HTMLInputElement).value) || 0;
                    const dv = Number((document.getElementById("dval") as HTMLInputElement).value) || 1;
                    answerRead(nv, dv);
                  }}>Responder</Btn>
                </div>
              </div>
            </div>
          )}
          {mode === "equiv" && (
            <div className="text-center">
              <div className="text-sm mb-2 text-slate-600">Fracción simplificada esperada</div>
              <FractionLabel n={goal.n} d={goal.d} />
              <div className="mt-4"><Btn onClick={() => settle(isCorrect)} variant="primary">Comprobar</Btn></div>
            </div>
          )}
        </Card>
      </div>

      {done && (
        <div className="max-w-5xl mx-auto mt-6">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-extrabold text-emerald-700">¡Fin de la ronda!</div>
              <p className="text-slate-600">Puntaje: {score}</p>
              <div className="mt-3"><Btn onClick={resetAll} variant="success">Jugar otra vez</Btn></div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GameFraccionesPizza;

