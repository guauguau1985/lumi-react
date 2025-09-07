// src/app/AppShell.tsx
import React, { createContext, useContext, useMemo, useState } from "react";
import GameEscalera from "../games/GameEscaleraNumerica"; // <- ruta relativa a tu repo
import GameRayos from "../games/GameRayosMagicos";
import GameFraccionesPizza from "../games/GameFraccionesPizza";
import GameSumaFracciones from "../games/GameSumaFracciones";


// ---------- Gamification Context ----------
type Badge = { id: string; label: string };
type Gamification = {
  xp: number;
  coins: number;
  level: number;
  badges: Badge[];
  addXP: (n: number) => void;
  addCoins: (n: number) => void;
  awardBadge: (b: Badge) => void;
};

const GamificationContext = createContext<Gamification | null>(null);
export const useGamification = () => {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error("GamificationContext outside provider");
  return ctx;
};

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [xp, setXP] = useState(0);
  const [coins, setCoins] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([]);
  const level = useMemo(() => 1 + Math.floor(xp / 100), [xp]); // 100 XP = 1 nivel

  const addXP = (n: number) => setXP((v) => Math.max(0, v + n));
  const addCoins = (n: number) => setCoins((v) => Math.max(0, v + n));
  const awardBadge = (b: Badge) =>
    setBadges((arr) => (arr.find((x) => x.id === b.id) ? arr : [...arr, b]));

  return (
    <GamificationContext.Provider value={{ xp, coins, level, badges, addXP, addCoins, awardBadge }}>
      {children}
    </GamificationContext.Provider>
  );
};

// ---------- Pequeños helpers UI ----------
const Btn: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  disabled?: boolean;
}> = ({ children, onClick, variant = "primary", disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={
      "px-4 py-2 rounded-xl text-sm font-semibold transition active:scale-[.98] focus:outline-none focus:ring-2 " +
      (variant === "primary"
        ? "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-400 disabled:opacity-50"
        : "bg-transparent text-emerald-700 hover:bg-emerald-50 focus:ring-emerald-300")
    }
  >
    {children}
  </button>
);

const StatPill: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="px-3 py-1 rounded-full bg-white/80 shadow text-sm font-semibold text-slate-700">
    {label}: <span className="text-emerald-700">{value}</span>
  </div>
);

// ---------- Mini-router sin dependencias ----------
export type Screen =
  | "Home"
  | "WorldsMap"
  | "EscaleraOA1"
  | "RayosOA2"
  | "MercadoOA3"
  | "FraccionesOA8"
  | "SumaFracOA9";


export const AppShell: React.FC = () => {
  const [screen, setScreen] = useState<Screen>("Home");
  const goto = (s: Screen) => setScreen(s);

  return (
    <GamificationProvider>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-sky-50">
        {screen === "Home" && <HomeScreen onOpenMap={() => goto("WorldsMap")} />}
        {screen === "WorldsMap" && (
          <WorldsMap onBack={() => goto("Home")} onPlayOA1={() => goto("EscaleraOA1")} />
        )}
        {screen === "EscaleraOA1" && <EscaleraOA1Screen onExit={() => goto("WorldsMap")} />}
        {screen === "RayosOA2" && <RayosOA2Screen onExit={() => goto("WorldsMap")} />}
        {screen === "FraccionesOA8" && <FraccionesOA8Screen onExit={() => goto("WorldsMap")} />}
        {screen === "SumaFracOA9" && <SumaFracOA9Screen onExit={() => goto("WorldsMap")} />}  
      </div>
    </GamificationProvider>
  );
};

// ---------- Home ----------
export const HomeScreen: React.FC<{ onOpenMap: () => void }> = ({ onOpenMap }) => {
  const { xp, level, coins } = useGamification();
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-emerald-800">Lumi · Inicio</h1>
        <div className="flex gap-2">
          <StatPill label="Nivel" value={level} />
          <StatPill label="XP" value={xp} />
          <StatPill label="Monedas" value={coins} />
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ModuleCard title="Matemáticas" description="Mundos y minijuegos" cta="Abrir mapa" onClick={onOpenMap} />
        <ModuleCard title="Programación" description="Secuencias y lógica" disabled />
        <ModuleCard title="Inteligencia Artificial" description="Clasificar, patrones, ética" disabled />
      </div>
    </div>
  );
};

const ModuleCard: React.FC<{
  title: string;
  description: string;
  cta?: string;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ title, description, cta = "Abrir", onClick, disabled }) => (
  <div className={`rounded-2xl p-5 bg-white/80 shadow border ${disabled ? "opacity-60" : "hover:shadow-md"}`}>
    <div className="text-xl font-bold text-slate-800">{title}</div>
    <p className="text-slate-600 mt-1">{description}</p>
    <div className="mt-4">
      <Btn onClick={onClick} disabled={disabled}>{cta}</Btn>
    </div>
  </div>
);

// ---------- Worlds Map (Matemáticas) ----------
export const WorldsMap: React.FC<{ onBack: () => void; onPlayOA1: () => void }> = ({
  onBack,
  onPlayOA1,
}) => {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-emerald-800">Mapa de Mundos · Matemáticas</h2>
        <Btn onClick={onBack} variant="ghost">Volver</Btn>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <WorldCard
          title="Reino de los Números"
          items={[
            { label: "OA1: Escalera numérica", onClick: onPlayOA1 },
            { label: "OA2: Rayos mágicos", onClick: onPlayOA1 },
            { label: "OA3: Mercado", locked: true },
          ]}
        />
        <WorldCard title="Isla de Patrones y Tiempo" locked />
        <WorldCard 
        title="Bosque de Fracciones"
        items={[
            { label: "OA8: Pizza de fracciones", onClick: () => goto("FraccionesOA8") },
            { label: "OA9: Suma y resta", onClick: () => goto("SumaFracOA9") },
  ]}
/>
        <WorldCard title="Ciudad de las Figuras" locked />
        <WorldCard title="Mar de los Decimales" locked />
        <WorldCard title="Universo Medidas y Datos" locked />
      </div>
    </div>
  );
};

const WorldCard: React.FC<{
  title: string;
  items?: { label: string; onClick?: () => void; locked?: boolean }[];
  locked?: boolean;
}> = ({ title, items = [], locked }) => (
  <div className={`rounded-2xl bg-white/80 p-5 shadow border ${locked ? "opacity-60" : ""}`}>
    <div className="flex items-center justify-between">
      <div className="text-lg font-bold text-slate-800">{title}</div>
      {locked ? <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-500">Bloqueado</span> : null}
    </div>
    {!locked && (
      <ul className="mt-3 space-y-2">
        {items.map((it, i) => (
          <li key={i}>
            <Btn onClick={it.onClick} variant="ghost">{it.label}</Btn>
          </li>
        ))}
      </ul>
    )}
  </div>
);

// ---------- Wrapper del juego OA1 ----------
export const EscaleraOA1Screen: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const { addXP, addCoins, awardBadge } = useGamification();

  const handleComplete = (score: number) => {
    addXP(score); // 1 punto = 1 XP
    addCoins(Math.round(score / 5));
    if (score >= 80) awardBadge({ id: "oa1_master", label: "OA1 Maestro" });
  };

  return (
    <div>
      <div className="max-w-5xl mx-auto p-4 flex justify-between items-center">
        <Btn onClick={onExit} variant="ghost">Volver al mapa</Btn>
        <div className="text-sm text-slate-600">OA1 · Escalera numérica</div>
      </div>
      <GameEscalera onComplete={handleComplete} />
    </div>
  );
};
// ---------- Wrapper del juego OA2 ----------
export const RayosOA2Screen: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const { addXP, addCoins, awardBadge } = useGamification();
  const handleComplete = (score: number) => {
    addXP(score);
    addCoins(Math.round(score / 5));
    if (score >= 90) awardBadge({ id: "oa2_speed", label: "OA2 Rayo veloz" });
  };
  return (
    <div>
      <div className="max-w-5xl mx-auto p-4 flex justify-between items-center">
        <Btn onClick={onExit} variant="ghost">Volver al mapa</Btn>
        <div className="text-sm text-slate-600">OA2 · Rayos mágicos</div>
      </div>
      <GameRayos onComplete={handleComplete} />
    </div>
  );
};
