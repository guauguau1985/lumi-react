import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// =============================================
// GameSumaFracciones – OA9 (4° básico)
// Sumar y restar fracciones con igual y distinto denominador (casos simples).
// Visual con etiquetas de fracción.
// onComplete(score) para gamificación externa.
// =============================================

type Op = "+" | "-";

type Task = {
  a: { n: number; d: number };
  b: { n: number; d: number };
  op: Op;
  solution: { n: number; d: number };
  sameDen: boolean;
};

function randInt(min: number, max: number) { return Math.floor(Math.random()*(max-min+1))+min; }
function gcd(a:number,b:number):number{ return b===0?a:gcd(b,a%b); }
function lcm(a:number,b:number){ return (a*b)/gcd(a,b); }
function simplify(n:number,d:number){ const g=gcd(n,d); return {n:Math.trunc(n/g),d:Math.trunc(d/g)}; }

function makeTask(level:number): Task {
  const sameDen = level < 3 ? true : Math.random() < 0.5;
  const denChoices = [2,3,4,5,6,8,10,12];
  const d1 = denChoices[randInt(0, denChoices.length-1)];
  const d2 = sameDen ? d1 : denChoices[randInt(0, denChoices.length-1)];
  const op: Op = Math.random()<0.5? "+" : "-";
  const a = { n: randInt(1, d1-1), d: d1 };
  const b = { n: randInt(1, d2-1), d: d2 };

  let n=0, d=0;
  if (sameDen) {
    d = d1;
    n = op === "+" ? a.n + b.n : a.n - b.n;
  } else {
    d = lcm(d1,d2);
    n = op === "+" ? a.n*(d/d1) + b.n*(d/d2) : a.n*(d/d1) - b.n*(d/d2);
  }
  if (n < 0) { // evitamos negativos para 4° básico
    return makeTask(level);
  }
  const sol = simplify(n,d);
  return { a, b, op, solution: sol, sameDen };
}

const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={`rounded-2xl shadow-lg p-5 bg-white/80 backdrop-blur ${className ?? ""}`}>{children}</div>
);

const Btn: React.FC<{ children: React.ReactNode; onClick?: () => void; variant?: "primary"|"ghost"|"success"|"danger"; }> = ({children,onClick,variant="primary"}) => (
  <button onClick={onClick} className={
    "px-4 py-2 rounded-xl text-sm font-semibold transition active:scale-[.98] focus:outline-none focus:ring-2 "+
    (variant==="primary"?"bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-400":"bg-transparent text-emerald-700 hover:bg-emerald-50 focus:ring-emerald-300")
  }>{children}</button>
);

const FractionLabel: React.FC<{ n:number; d:number }> = ({ n, d }) => (
  <div className="inline-flex flex-col items-center leading-none">
    <span className="text-2xl font-bold text-slate-800">{n}</span>
    <span className="w-full h-px bg-slate-400 my-0.5" />
    <span className="text-2xl font-bold text-slate-800">{d}</span>
  </div>
);

const GameSumaFracciones: React.FC<{ onComplete?: (score:number)=>void }> = ({ onComplete }) => {
  const [level, setLevel] = useState(3);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [task, setTask] = useState<Task>(() => makeTask(3));
  const [done, setDone] = useState(false);

  const [nAns, setNAns] = useState<number | "">("");
  const [dAns, setDAns] = useState<number | "">("");

  useEffect(()=>{ setTask(makeTask(level)); },[level]);
  useEffect(()=>{ if(lives===0) setDone(true); },[lives]);
  useEffect(()=>{ if(done) onComplete?.(score); },[done, score, onComplete]);

  function submit(){
    const n = Number(nAns||0), d = Number(dAns||1);
    const simp = simplify(n,d);
    const ok = simp.n === task.solution.n && simp.d === task.solution.d;
    if (ok){
      const s = streak + 1; setStreak(s);
      setScore((x)=> x + 10 + Math.max(0, s-1)*2);
      if (s%3===0) setLevel((lv)=> Math.min(8, lv+1));
      setTask(makeTask(level));
      setNAns(""); setDAns("");
    } else {
      setStreak(0); setLives((h)=> Math.max(0, h-1));
    }
  }

  function reset(){
    setLevel(3); setLives(3); setScore(0); setStreak(0);
    setTask(makeTask(3)); setNAns(""); setDAns(""); setDone(false);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-violet-50 to-emerald-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-800">Sumar y Restar Fracciones · OA9</h1>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="px-3 py-1 rounded-full bg-white/80 shadow">Vidas {"❤️".repeat(lives)}{"🤍".repeat(3-lives)}</span>
          <span className="px-3 py-1 rounded-full bg-white/80 shadow">Racha {streak}</span>
          <span className="px-3 py-1 rounded-full bg-white/80 shadow font-bold">Puntaje {score}</span>
          <span className="px-3 py-1 rounded-full bg-white/80 shadow">Nivel {level}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-4 mt-6">
        <Card>
          <div className="flex items-center gap-3">
            <FractionLabel n={task.a.n} d={task.a.d} />
            <span className="text-2xl font-bold text-slate-700">{task.op}</span>
            <FractionLabel n={task.b.n} d={task.b.d} />
            <span className="text-2xl font-bold text-slate-700">=</span>
            <FractionLabel n={"?" as unknown as number} d={"?" as unknown as number} />
          </div>
          <div className="mt-4 text-sm text-slate-600">
            {task.sameDen ? (
              <span>Mismo denominador: suma/resta numeradores y conserva el denominador. Simplifica.</span>
            ) : (
              <span>Distinto denominador: busca un denominador común (MCM) y luego simplifica.</span>
            )}
          </div>
        </Card>

        <Card>
          <div className="text-sm text-slate-600 mb-2">Respuesta (en forma simplificada)</div>
          <div className="flex items-center gap-2">
            <input className="w-20 rounded border px-2 py-1" placeholder="n" type="number" value={nAns as number | ""} onChange={(e)=> setNAns(e.target.value===""?"": Number(e.target.value))} />
            <span className="text-slate-400">/</span>
            <input className="w-20 rounded border px-2 py-1" placeholder="d" type="number" value={dAns as number | ""} onChange={(e)=> setDAns(e.target.value===""?"": Number(e.target.value))} />
            <Btn onClick={submit}>Comprobar</Btn>
          </div>
          <div className="mt-3 text-xs text-slate-500">Consejo: si {task.a.d} y {task.b.d} no coinciden, usa {`mcm(${task.a.d}, ${task.b.d}) = ${lcm(task.a.d, task.b.d)}`}.</div>
        </Card>
      </div>

      {done && (
        <div className="max-w-5xl mx-auto mt-6">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-extrabold text-emerald-700">¡Fin de la ronda!</div>
              <p className="text-slate-600">Puntaje: {score}</p>
              <div className="mt-3"><Btn onClick={reset} variant="success">Jugar otra vez</Btn></div>
            </div>
          </Card>
        </div>
      )}

      <div className="max-w-5xl mx-auto mt-6">
        <Card>
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">Dificultad</div>
            <input type="range" min={1} max={8} value={level} onChange={(e)=> setLevel(parseInt(e.target.value))} />
            <Btn variant="ghost" onClick={()=> setTask(makeTask(level))}>Nueva</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GameSumaFracciones;
