import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

// =============================================
// GameBarrasDatos – OA11 (4° básico)
// Leer e interpretar gráficos de barras simples y dobles.
// Modos: 1) Lectura (¿cuánto hay en…?), 2) Comparación (¿cuál es mayor/menor?), 3) Diferencia (¿cuántos más que…?).
// =============================================

type Mode = "read" | "compare" | "diff";

type Serie = { label: string; value: number };

type Dataset = {
  title: string;
  series: Serie[]; // 4–6 categorías
};

function randInt(min:number,max:number){ return Math.floor(Math.random()*(max-min+1))+min; }
function pick<T>(arr:T[]):T{ return arr[Math.floor(Math.random()*arr.length)]; }

const animals = ["Gatos","Perros","Aves","Peces","Conejos","Hamsters"];
const fruits = ["Manzanas","Plátanos","Peras","Naranjas","Uvas","Frutillas"];

function makeDataset(): Dataset {
  const pool = Math.random()<0.5? animals: fruits;
  const count = randInt(4,6);
  const labels = [...pool].sort(()=> Math.random()-0.5).slice(0,count);
  const series: Serie[] = labels.map(l=> ({ label: l, value: randInt(3,18) }));
  return { title: "Encuesta de la clase", series };
}

const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={`rounded-2xl shadow-lg p-5 bg-white/80 backdrop-blur ${className ?? ""}`}>{children}</div>
);

const Btn: React.FC<{ children: React.ReactNode; onClick?: () => void; variant?: "primary"|"ghost"|"success"|"danger"; }>
= ({children,onClick,variant="primary"}) => (
  <button onClick={onClick} className={
    "px-4 py-2 rounded-xl text-sm font-semibold transition active:scale-[.98] focus:outline-none focus:ring-2 "+
    (variant==="primary"?"bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-400":"bg-transparent text-emerald-700 hover:bg-emerald-50 focus:ring-emerald-300")
  }>{children}</button>
);

const Bars: React.FC<{ data: Dataset; onPick?: (label: string)=>void }>= ({ data, onPick }) => {
  const max = Math.max(...data.series.map(s=> s.value));
  return (
    <div className="w-full">
      <div className="text-center text-slate-700 font-semibold mb-2">{data.title}</div>
      <div className="grid grid-cols-12 gap-2 items-end h-60">
        {data.series.map(s=> (
          <div key={s.label} className="col-span-2 flex flex-col items-center gap-2">
            <div
              className="w-8 rounded-t bg-emerald-500 cursor-pointer"
              style={{ height: `${(s.value/max)*90}%` }}
              title={`${s.label}: ${s.value}`}
              onClick={()=> onPick?.(s.label)}
            />
            <div className="text-[11px] text-center leading-tight">{s.label}</div>
            <div className="text-[10px] text-slate-500">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const GameBarrasDatos: React.FC<{ onComplete?: (score:number)=>void }> = ({ onComplete }) => {
  const [mode,setMode] = useState<Mode>("read");
  const [lives,setLives] = useState(3);
  const [score,setScore] = useState(0);
  const [streak,setStreak] = useState(0);

  const [ds,setDs] = useState<Dataset>(()=> makeDataset());
  const [question,setQuestion] = useState<string>("");
  const [answer,setAnswer] = useState<string>("");

  useEffect(()=>{ newRound("read"); },[]);
  useEffect(()=>{ if(lives===0) onComplete?.(score); },[lives,score,onComplete]);

  function newRound(m:Mode){
    const d = makeDataset(); setDs(d); setMode(m);
    if(m==="read"){
      const target = pick(d.series);
      setQuestion(`¿Cuántos ${target.label.toLowerCase()} hay?`);
      setAnswer(String(target.value));
    } else if(m==="compare"){
      const [a,b] = d.series.sort(()=> Math.random()-0.5).slice(0,2);
      setQuestion(`¿Cuál es mayor: ${a.label} o ${b.label}?`);
      setAnswer(a.value===b.value? "empate" : (a.value>b.value? a.label : b.label));
    } else {
      const [a,b] = d.series.sort(()=> Math.random()-0.5).slice(0,2);
      setQuestion(`¿Cuántos más ${a.label.toLowerCase()} que ${b.label.toLowerCase()}?`);
      setAnswer(String(Math.abs(a.value-b.value)));
    }
  }

  function settle(pick?: string){
    let correct=false;
    if(mode==="read"){
      // pick trae la barra clickeada → comparamos valor
      if(pick){
        const v = ds.series.find(s=> s.label===pick)?.value ?? -999;
        correct = String(v)===answer;
      }
    } else if(mode==="compare"){
      correct = pick?.toLowerCase()===answer.toLowerCase();
    } else {
      if(pick){ // si clickea una barra, no tiene sentido, pedimos texto
        correct=false;
      }
      // modo diff: pedimos respuesta exacta en input
      const input = (document.getElementById("ans") as HTMLInputElement | null)?.value?.trim() ?? "";
      correct = input === answer;
    }

    if(correct){ const s=streak+1; setStreak(s); setScore(x=> x+10+Math.max(0,s-1)*2); }
    else { setStreak(0); setLives(h=> Math.max(0,h-1)); }
    newRound(mode);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-amber-50 to-sky-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-800">Gráficos de Barras · OA11</h1>
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
            <Btn variant={mode==="read"?"success":"ghost"} onClick={()=> newRound("read")}>Lectura</Btn>
            <Btn variant={mode==="compare"?"success":"ghost"} onClick={()=> newRound("compare")}>Comparación</Btn>
            <Btn variant={mode==="diff"?"success":"ghost"} onClick={()=> newRound("diff")}>Diferencia</Btn>
          </div>
          <div className="mt-3 text-slate-700">{question}</div>
          {mode==="diff" && (
            <div className="mt-2 flex items-center gap-2">
              <input id="ans" className="w-24 rounded border px-2 py-1" placeholder="respuesta" />
              <Btn onClick={()=> settle()}>Comprobar</Btn>
            </div>
          )}
        </Card>

        <Card className="w-full">
          <Bars data={ds} onPick={(label)=> settle(label)} />
        </Card>
      </div>
    </div>
  );
};

export default GameBarrasDatos;
