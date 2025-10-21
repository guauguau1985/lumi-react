import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// =============================================
// GameAcuarioDecimal – OA10 (4° básico)
// Décimos y centésimos: relaciona fracciones 1/10, 1/100 con decimales (0.1, 0.01),
// ubica en recta numérica y compone descomposición (ej: 0.37 = 3 décimos + 7 centésimos).
// Modos: 1) Colorea peceras (rejilla 10x10) = lectura/escritura de decimales.
//        2) Recta numérica en [0,1] con marcas de 0.1 y 0.01.
//        3) Descomposición: arrastrar tarjetas (décimos/centésimos) para formar un número objetivo.
// =============================================

type Mode = "grid" | "numberline" | "compose";

function clamp(n:number, min=0, max=1){ return Math.max(min, Math.min(max, n)); }
function randInt(min:number, max:number){ return Math.floor(Math.random()*(max-min+1))+min; }

const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={`rounded-2xl shadow-lg p-5 bg-white/80 backdrop-blur ${className ?? ""}`}>{children}</div>
);

const Btn: React.FC<{ children: React.ReactNode; onClick?: () => void; variant?: "primary"|"ghost"|"success"|"danger"; disabled?: boolean; }>
= ({children,onClick,variant="primary",disabled}) => (
  <button onClick={onClick} disabled={disabled} className={
    "px-4 py-2 rounded-xl text-sm font-semibold transition active:scale-[.98] focus:outline-none focus:ring-2 "+
    (variant==="primary"?"bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-400 disabled:opacity-50":
     variant==="success"?"bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-400":
     variant==="danger"?"bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-400":
     "bg-transparent text-emerald-700 hover:bg-emerald-50 focus:ring-emerald-300")
  }>{children}</button>
);

const Grid10x10: React.FC<{ filled: number; onChange?: (cells:number)=>void; editable?: boolean }>
= ({ filled, onChange, editable }) => {
  const cells = Array.from({length:100},(_,i)=> i < filled);
  return (
    <div className="grid grid-cols-10 gap-0.5">
      {cells.map((isFilled, i)=> (
        <div key={i}
          onClick={()=> editable && onChange?.(i+1)}
          className={"w-6 h-6 border " + (isFilled?"bg-emerald-500/80 border-emerald-400":"bg-white border-slate-200")}
          title={`${i+1}/100`} />
      ))}
    </div>
  );
};

function toDecimalFromCells(cells:number){
  const d = cells/100; // centésimos
  return Number(d.toFixed(2));
}

const NumberLine: React.FC<{ value:number; step: 0.1 | 0.01; onPick?: (v:number)=>void }>
= ({ value, step, onPick }) => {
  const ticks = step===0.1? 11: 101; // 0..1
  return (
    <div className="w-full">
      <div className="relative h-10">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-300" />
        {Array.from({length:ticks}).map((_,i)=>{
          const x = (i/(ticks-1))*100;
          const label = step===0.1? (i/10).toFixed(1): (i/100).toFixed(2);
          const isActive = Math.abs((step===0.1? i/10 : i/100) - value) < 1e-9;
          return (
            <div key={i} className="absolute" style={{ left: `calc(${x}% - 1px)` }}>
              <div className={`w-0.5 ${i% (step===0.1?1:10)===0? 'h-4':'h-3'} bg-slate-400`}></div>
              { (step===0.1 || i%10===0) && (
                <div className={`text-[10px] mt-1 ${isActive? 'text-emerald-700 font-bold':'text-slate-600'}`}>{label}</div>
              )}
              <div
                onClick={()=> onPick?.(step===0.1? i/10 : Number((i/100).toFixed(2)))}
                className="absolute -top-2 -left-2 w-4 h-6 cursor-pointer"/>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const GameAcuarioDecimal: React.FC<{ onComplete?: (score:number)=>void }> = ({ onComplete }) => {
  const [mode,setMode] = useState<Mode>("grid");
  const [lives,setLives] = useState(3);
  const [score,setScore] = useState(0);
  const [streak,setStreak] = useState(0);

  // GRID state
  const [cells,setCells] = useState(0); // 0..100
  const [goalCells,setGoalCells] = useState(37); // 0.37

  // NUMBERLINE state
  const [goalLine,setGoalLine] = useState(0.6);
  const [step,setStep] = useState<0.1|0.01>(0.1);

  // COMPOSE state
  const [tens,setTens] = useState(3); // décimos
  const [cents,setCents] = useState(7); // centésimos
  const goalCompose = useMemo(()=> Number((tens/10 + cents/100).toFixed(2)),[tens,cents]);

  useEffect(()=>{ newRound("grid"); },[]);
  useEffect(()=>{ if(lives===0) onComplete?.(score); },[lives,score,onComplete]);

  function newRound(m:Mode){
    if(m==="grid"){
      const n = randInt(5,95); setGoalCells(n); setCells(0);
    } else if (m==="numberline"){
      const st = Math.random()<0.5? 0.1: 0.01; setStep(st as 0.1|0.01);
      const val = st===0.1? randInt(1,9)/10 : Number((randInt(5,95)/100).toFixed(2));
      setGoalLine(val);
    } else {
      setTens(randInt(0,9)); setCents(randInt(0,9));
    }
  }

  function settle(correct:boolean){
    if(correct){
      const s = streak+1; setStreak(s); setScore(x=> x+10+Math.max(0,s-1)*2);
    } else { setStreak(0); setLives(h=> Math.max(0,h-1)); }
    newRound(mode);
  }

  // checks
  const correctGrid = useMemo(()=> cells===goalCells, [cells,goalCells]);
  const correctLine = useMemo(()=> step===0.1? goalLine===goalLine : true, [step,goalLine]); // validación en click
  const currentCompose = useMemo(()=> Number((tens/10 + cents/100).toFixed(2)),[tens,cents]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-cyan-50 to-emerald-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-800">Acuario Decimal · OA10</h1>
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
            <Btn variant={mode==="grid"?"success":"ghost"} onClick={()=>{setMode("grid"); newRound("grid");}}>Pecera 10×10</Btn>
            <Btn variant={mode==="numberline"?"success":"ghost"} onClick={()=>{setMode("numberline"); newRound("numberline");}}>Recta 0–1</Btn>
            <Btn variant={mode==="compose"?"success":"ghost"} onClick={()=>{setMode("compose"); newRound("compose");}}>Descomponer</Btn>
          </div>
          <div className="mt-3 text-sm text-slate-600">
            {mode==="grid" && <span>Colorea exactamente <b>{(goalCells/100).toFixed(2)}</b> ( {Math.floor(goalCells/10)} décimos y {goalCells%10} centésimos ).</span>}
            {mode==="numberline" && <span>Marca en la recta el valor <b>{goalLine.toFixed(2)}</b> (pasos de {step===0.1?"0.1":"0.01"}).</span>}
            {mode==="compose" && <span>Forma el número con tarjetas de décimos/centésimos.</span>}
          </div>
        </Card>

        <Card>
          {mode==="grid" && (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600">Actual</div>
                <div className="text-xl font-bold text-slate-800">{toDecimalFromCells(cells).toFixed(2)}</div>
              </div>
              <Btn onClick={()=> settle(cells===goalCells)}>Comprobar</Btn>
            </div>
          )}
          {mode==="numberline" && (
            <div className="text-sm text-slate-600">Toca la marca correspondiente. Luego valida.</div>
          )}
          {mode==="compose" && (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600">Actual</div>
                <div className="text-xl font-bold text-slate-800">{currentCompose.toFixed(2)}</div>
              </div>
              <Btn onClick={()=> settle(currentCompose===goalCompose)}>Comprobar</Btn>
            </div>
          )}
        </Card>
      </div>

      {/* Zona de interacción */}
      <div className="max-w-5xl mx-auto mt-6 grid md:grid-cols-2 gap-6 place-items-center">
        {mode==="grid" && (
          <Card>
            <Grid10x10 filled={cells} editable onChange={(n)=> setCells(n)} />
          </Card>
        )}
        {mode==="numberline" && (
          <Card className="w-full">
            <NumberLine value={goalLine} step={step} onPick={(v)=> settle(Number(v.toFixed(2))===Number(goalLine.toFixed(2)))} />
          </Card>
        )}
        {mode==="compose" && (
          <>
            <Card>
              <div className="text-slate-700">Décimos</div>
              <div className="flex items-center gap-3 mt-2">
                <Btn variant="ghost" onClick={()=> setTens(t=> Math.max(0,t-1))}>-</Btn>
                <div className="text-xl font-bold w-8 text-center">{tens}</div>
                <Btn variant="ghost" onClick={()=> setTens(t=> Math.min(9,t+1))}>+</Btn>
              </div>
            </Card>
            <Card>
              <div className="text-slate-700">Centésimos</div>
              <div className="flex items-center gap-3 mt-2">
                <Btn variant="ghost" onClick={()=> setCents(c=> Math.max(0,c-1))}>-</Btn>
                <div className="text-xl font-bold w-8 text-center">{cents}</div>
                <Btn variant="ghost" onClick={()=> setCents(c=> Math.min(9,c+1))}>+</Btn>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default GameAcuarioDecimal;
