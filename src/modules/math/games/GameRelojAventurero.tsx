import React, { useEffect, useMemo, useState } from "react";

// =============================================
// OA12 · Tiempo y Duraciones (4° básico)
// Modos: read (leer), set (ajustar), add (duración), diff (intervalo)
// =============================================

type Mode = "read" | "set" | "add" | "diff";
type T = { h: number; m: number };

function randInt(a: number, b: number) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function pad2(n: number) { return n.toString().padStart(2, "0"); }
function clamp(n: number, a: number, b: number) { return Math.max(a, Math.min(b, n)); }
function toMinutes(t: T) { return ((t.h % 24) * 60 + t.m) % (24 * 60); }
function fromMinutes(v: number): T { const x = ((v % (24 * 60)) + (24 * 60)) % (24 * 60); return { h: Math.floor(x / 60), m: x % 60 }; }
function fmtHM(t: T) { return `${pad2(t.h)}:${pad2(t.m)}`; }

// ===== Analog Clock (SVG responsivo + touch) =====
const Clock: React.FC<{
  time: T;
  editable?: boolean;
  onChange?: (t: T) => void;
}> = ({ time, editable, onChange }) => {
  const size = 220; const r = 100; const cx = 110; const cy = 110;

  const angM = (time.m / 60) * 2 * Math.PI - Math.PI / 2; // minute angle
  const angH =
    ((time.h % 12) / 12) * 2 * Math.PI +
    (time.m / 60) * (2 * Math.PI / 12) -
    Math.PI / 2;

  const mx = cx + Math.cos(angM) * (r - 12);
  const my = cy + Math.sin(angM) * (r - 12);
  const hx = cx + Math.cos(angH) * (r - 40);
  const hy = cy + Math.sin(angH) * (r - 40);

  function commitPointer(clientX: number, clientY: number, svg: SVGSVGElement) {
    if (!editable || !onChange) return;
    const rect = svg.getBoundingClientRect();
    const x = clientX - rect.left - cx;
    const y = clientY - rect.top - cy;
    const angle = Math.atan2(y, x) + Math.PI / 2; // 0 arriba
    let mins = Math.round(((angle + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI) * 60);
    if (mins === 60) mins = 0;
    onChange({ h: time.h, m: mins });
  }

  return (
    <div className="w-full max-w-[280px] md:max-w-[320px] aspect-square">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-full w-full select-none"
        onMouseMove={(e) => editable && e.buttons === 1 && commitPointer(e.clientX, e.clientY, e.currentTarget)}
        onClick={(e) => editable && commitPointer(e.clientX, e.clientY, e.currentTarget)}
        onTouchStart={(e) => editable && commitPointer(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget)}
        onTouchMove={(e) => editable && commitPointer(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget)}
      >
        <defs>
          <filter id="shadow"><feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#0003" /></filter>
        </defs>

        <circle cx={cx} cy={cy} r={r} fill="#fff" stroke="#cbd5e1" strokeWidth={2} filter="url(#shadow)" />

        {/* Marcas */}
        {Array.from({ length: 60 }).map((_, i) => {
          const a = (i / 60) * 2 * Math.PI;
          const x1 = cx + Math.cos(a) * (r - (i % 5 === 0 ? 10 : 6));
          const y1 = cy + Math.sin(a) * (r - (i % 5 === 0 ? 10 : 6));
          const x2 = cx + Math.cos(a) * r;
          const y2 = cy + Math.sin(a) * r;
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#94a3b8"
              strokeWidth={i % 5 === 0 ? 2 : 1}
            />
          );
        })}

        {/* Números */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = ((i + 1) / 12) * 2 * Math.PI - Math.PI / 2;
          const x = cx + Math.cos(a) * (r - 24);
          const y = cy + Math.sin(a) * (r - 24);
          return (
            <text key={i} x={x} y={y + 4} textAnchor="middle" fontSize="12" fill="#334155">
              {i + 1}
            </text>
          );
        })}

        {/* Agujas */}
        <line x1={cx} y1={cy} x2={hx} y2={hy} stroke="#0ea5e9" strokeWidth={4} strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={mx} y2={my} stroke="#10b981" strokeWidth={3} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={3} fill="#0f172a" />
      </svg>
    </div>
  );
};

// ---- UI helpers
const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={`rounded-2xl shadow-lg p-4 sm:p-5 bg-white/80 backdrop-blur ${className ?? ""}`}>{children}</div>
);

const Btn: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "success" | "danger";
}> = ({ children, onClick, variant = "primary" }) => (
  <button
    onClick={onClick}
    className={
      "px-4 sm:px-6 h-12 sm:h-12 rounded-2xl text-sm sm:text-base font-semibold transition active:scale-[.98] focus:outline-none focus:ring-2 " +
      (variant === "primary"
        ? "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-400"
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

// ===== Juego principal =====
const GameRelojAventurero: React.FC<{ onComplete?: (score: number) => void }> = ({ onComplete }) => {
  const [mode, setMode] = useState<Mode>("read");
  const [level, setLevel] = useState(3); // 1..8
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // Round state
  const [shown, setShown] = useState<T>({ h: 7, m: 30 });
  const [target, setTarget] = useState<T>({ h: 8, m: 45 });

  useEffect(() => { newRound("read"); }, []);
  useEffect(() => { if (lives === 0) onComplete?.(score); }, [lives, score, onComplete]);

  function stepMinutes() { return level <= 2 ? 15 : level <= 4 ? 5 : 1; }

  function randomTime(step = 5): T {
    const m = Math.round(randInt(0, 59) / step) * step;
    const h = randInt(0, 23);
    return { h: h % 24, m: m % 60 };
  }

  function newRound(m: Mode) {
    setMode(m);
    if (m === "read") {
      const t = randomTime(stepMinutes()); setShown(t); setTarget({ h: 0, m: 0 });
    } else if (m === "set") {
      const t = randomTime(stepMinutes()); setTarget(t); setShown({ h: 6, m: 0 });
    } else if (m === "add") {
      const start = randomTime(stepMinutes());
      const addM = (level <= 3 ? randInt(10, 60) : randInt(5, 180));
      setShown(start); setTarget(fromMinutes(toMinutes(start) + addM));
    } else {
      // diff
      const a = randomTime(stepMinutes()); const b = randomTime(stepMinutes());
      const A = toMinutes(a), B = toMinutes(b); const [s, e] = A <= B ? [a, b] : [b, a];
      setShown(s); setTarget(e);
    }
  }

  function settle(correct: boolean) {
    if (correct) {
      const s = streak + 1;
      setStreak(s);
      setScore((x) => x + 10 + Math.max(0, s - 1) * 2);
      if (s % 3 === 0) setLevel((lv) => Math.min(8, lv + 1));
    } else {
      setStreak(0);
      setLives((h) => Math.max(0, h - 1));
    }
    newRound(mode);
  }

  // Inputs
  const [ansH, setAnsH] = useState<string>("");
  const [ansM, setAnsM] = useState<string>("");

  function checkTypedAgainst(t: T) {
    const h = clamp(parseInt(ansH || "0"), 0, 23);
    const m = clamp(parseInt(ansM || "0"), 0, 59);
    const ok = h === t.h && m === t.m;
    settle(ok);
    setAnsH(""); setAnsM("");
  }

  function minutesDiff(a: T, b: T) { return toMinutes(b) - toMinutes(a); }

  const InputHM = (
    <>
      <input
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={2}
        placeholder="HH"
        value={ansH}
        onChange={(e) => setAnsH(e.target.value.replace(/\D/g, "").slice(0, 2))}
        className="w-16 sm:w-20 h-12 sm:h-14 text-lg sm:text-2xl text-center rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
      />
      <span className="text-2xl sm:text-3xl text-slate-400">:</span>
      <input
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={2}
        placeholder="MM"
        value={ansM}
        onChange={(e) => setAnsM(e.target.value.replace(/\D/g, "").slice(0, 2))}
        className="w-16 sm:w-20 h-12 sm:h-14 text-lg sm:text-2xl text-center rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
      />
    </>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-50 to-emerald-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-800">Reloj Aventurero · OA12</h1>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="px-3 py-1 rounded-full bg-white/80 shadow">Vidas {"❤️".repeat(lives)}{"🤍".repeat(3 - lives)}</span>
          <span className="px-3 py-1 rounded-full bg-white/80 shadow">Racha {streak}</span>
          <span className="px-3 py-1 rounded-full bg-white/80 shadow font-bold">Puntaje {score}</span>
          <span className="px-3 py-1 rounded-full bg-white/80 shadow">Nivel {level}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-700">Modo</span>
            <Btn variant={mode === "read" ? "success" : "ghost"} onClick={() => newRound("read")}>Leer</Btn>
            <Btn variant={mode === "set" ? "success" : "ghost"} onClick={() => newRound("set")}>Ajustar</Btn>
            <Btn variant={mode === "add" ? "success" : "ghost"} onClick={() => newRound("add")}>Duración</Btn>
            <Btn variant={mode === "diff" ? "success" : "ghost"} onClick={() => newRound("diff")}>Intervalo</Btn>
          </div>
          <div className="mt-3 text-sm sm:text-base text-slate-600">
            {mode === "read" && <span>Observa el reloj y escribe la hora en formato <b>HH:MM</b>.</span>}
            {mode === "set" && <span>Ajusta el reloj a <b>{fmtHM(target)}</b> moviendo el minutero (verde).</span>}
            {mode === "add" && <span>Desde <b>{fmtHM(shown)}</b>, suma una duración y escribe la <b>hora final</b>.</span>}
            {mode === "diff" && <span>Entre <b>{fmtHM(shown)}</b> y <b>{fmtHM(target)}</b>, escribe la <b>duración</b> (HH:MM).</span>}
          </div>
        </Card>

        <Card>
          {mode === "read" && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Clock time={shown} />
              <div className="flex items-center gap-3">
                {InputHM}
                <Btn onClick={() => checkTypedAgainst(shown)}>Comprobar</Btn>
              </div>
            </div>
          )}

          {mode === "set" && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Clock time={shown} editable onChange={(t) => setShown(t)} />
              <div className="text-center sm:text-right">
                <div className="text-sm text-slate-600">Objetivo</div>
                <div className="text-xl sm:text-2xl font-bold text-slate-800">{fmtHM(target)}</div>
                <div className="mt-3">
                  <Btn onClick={() => settle(shown.h === target.h && shown.m === target.m)}>Comprobar</Btn>
                </div>
              </div>
            </div>
          )}

          {mode === "add" && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Clock time={shown} />
              <div className="flex items-center gap-3">
                {InputHM}
                <Btn onClick={() => checkTypedAgainst(target)}>Comprobar</Btn>
              </div>
            </div>
          )}

          {mode === "diff" && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Clock time={shown} />
                <Clock time={target} />
              </div>
              <div className="flex items-center gap-3">
                {InputHM}
                <Btn
                  onClick={() => {
                    const h = clamp(parseInt(ansH || "0"), 0, 23);
                    const m = clamp(parseInt(ansM || "0"), 0, 59);
                    const diff = minutesDiff(shown, target);
                    const ans = h * 60 + m;
                    settle(ans === diff);
                    setAnsH(""); setAnsM("");
                  }}
                >
                  Comprobar
                </Btn>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="max-w-5xl mx-auto mt-6">
        <Card>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm sm:text-base text-slate-600">Dificultad</div>
            <input
              type="range"
              min={1}
              max={8}
              value={level}
              onChange={(e) => setLevel(parseInt(e.target.value))}
              className="w-full sm:w-auto"
            />
            <Btn variant="ghost" onClick={() => newRound(mode)}>Nueva</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GameRelojAventurero;
