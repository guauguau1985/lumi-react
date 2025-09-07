import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// =============================================
// GameRayosMagicos – OA2 (4° básico)
// Cálculo mental con sumas, restas y multiplicaciones simples.
// Mecánica: Lumi lanza un "rayo" al resultado correcto. Dificultad adaptativa.
// onComplete(score) para gamificación externa.
// =============================================

type Op = "+" | "-" | "×";

type Problem = {
  a: number;
  b: number;
  op: Op;
  answer: number;
  choices: number[];
};

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uniqueChoices(correct: number, spread = 8): number[] {
  const set = new Set<number>([correct]);
  while (set.size < 3) {
    const delta = randInt(-spread, spread) || randInt(2, 4);
    set.add(correct + delta);
  }
  return Array.from(set).sort(() => Math.random() - 0.5);
}

function makeProblem(level: number): Problem {
  // Nivel controla el rango de números y operadores
  // 1-2: + y - hasta 20; 3-4: + y - hasta 50; 5+: incluye × (2, 5, 10)
  const includeMult = level >= 5;
  const ops: Op[] = includeMult ? ["+", "-", "×"] : ["+", "-"];
  const op = pick(ops);

  let a = 0, b = 0, answer = 0, spread = 8;
  if (op === "+") {
    const max = level < 3 ? 20 : level < 5 ? 50 : 100;
    a = randInt(0, max);
    b = randInt(0, max);
    answer = a + b;
    spread = Math.max(6, Math.round(max / 6));
  } else if (op === "-") {
    const max = level < 3 ? 20 : level < 5 ? 50 : 100;
    a = randInt(0, max);
    b = randInt(0, a); // no negativos
    answer = a - b;
    spread = Math.max(6, Math.round(max / 6));
  } else {
    // multiplicaciones simples usadas en cálculo mental de 4°: 2, 5, 10, 3, 4
    const table = level < 7 ? [2, 5, 10] : [2, 3, 4, 5, 10];
    a = randInt(1, 12);
    b = pick(table);
    answer = a * b;
    spread = Math.max(6, Math.round((a * b) / 4));
  }

  const choices = uniqueChoices(answer, spread);
  return { a, b, op, answer, choices };
}

const Ray: React.FC<{ fire: boolean }> = ({ fire }) => (
  <AnimatePresence>
    {fire && (
      <motion.div
        key="ray"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="h-2 w-full origin-left bg-emerald-500 rounded-full shadow"
      />
    )}
  </AnimatePresence>
);

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`rounded-2xl shadow-lg p-5 bg-white/80 backdrop-blur ${className ?? ""}`}>{children}</div>
);

const Btn: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger" | "success";
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

const GameRayosMagicos: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [problem, setProblem] = useState<Problem>(() => makeProblem(1));
  const [firing, setFiring] = useState(false);
  const [done, setDone] = useState(false);

  // genera nuevo problema
  function nextProblem(correct: boolean) {
    if (correct) {
      const s = streak + 1;
      setStreak(s);
      const lvlUp = s % 3 === 0 ? 1 : 0; // cada 3 aciertos sube dificultad
      setLevel((lv) => Math.min(10, lv + lvlUp));
      setScore((x) => x + 10 + Math.max(0, s - 1) * 2); // bonus por racha
    } else {
      setStreak(0);
      setLives((h) => Math.max(0, h - 1));
    }
    setProblem(makeProblem(level));
  }

  useEffect(() => {
    if (lives === 0) setDone(true);
  }, [lives]);

  useEffect(() => {
    if (done) onComplete?.(score);
  }, [done, score, onComplete]);

  const question = useMemo(() => `${problem.a} ${problem.op} ${problem.b} = ?`, [problem]);

  function choose(n: number) {
    if (done) return;
    const correct = n === problem.answer;
    setFiring(true);
    setTimeout(() => setFiring(false), 280);
    nextProblem(correct);
  }

  function resetAll() {
    setLevel(1);
    setLives(3);
    setScore(0);
    setStreak(0);
    setProblem(makeProblem(1));
    setDone(false);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-indigo-50 to-sky-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold text-indigo-800">Rayos mágicos · OA2</h1>
        <div className="flex gap-2 text-sm">
          <span className="px-3 py-1 rounded-full bg-white/80 shadow">Nivel {level}</span>
          <span className="px-3 py-1 rounded-full bg-white/80 shadow">Vidas {"❤️".repeat(lives)}{"🤍".repeat(3-lives)}</span>
          <span className="px-3 py-1 rounded-full bg-white/80 shadow">Racha {streak}</span>
          <span className="px-3 py-1 rounded-full bg-white/80 shadow font-bold">Puntaje {score}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-6 grid gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl md:text-5xl font-extrabold text-slate-800">
              {question}
            </div>
            <div className="mt-6 max-w-xl mx-auto">
              <Ray fire={firing} />
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {problem.choices.map((c) => (
                <Btn key={c} onClick={() => choose(c)} variant="ghost">{c}</Btn>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-600">Dificultad</span>
            <input
              type="range"
              min={1}
              max={10}
              value={level}
              onChange={(e) => setLevel(parseInt(e.target.value))}
            />
            <Btn onClick={resetAll} variant="primary">Reiniciar</Btn>
          </div>
        </Card>

        {done && (
          <Card>
            <div className="text-center">
              <div className="text-2xl font-extrabold text-emerald-700">¡Fin de la ronda!</div>
              <p className="text-slate-600">Puntaje: {score}</p>
              <div className="mt-3">
                <Btn onClick={resetAll} variant="success">Jugar otra vez</Btn>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GameRayosMagicos;
