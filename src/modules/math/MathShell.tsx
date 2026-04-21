import { NavLink, Route, Routes, useNavigate } from "react-router-dom";

import WorldsMap from "@/modules/math/WorldsMap";
import DivisionShell from "@/modules/math/games/divisiones/DivisionShell";

// Juegos
import GameEscaleraNumerica from "@/modules/math/games/GameEscaleraNumerica";
import GameRayosMagicos from "@/modules/math/games/GameRayosMagicos";
import GameFraccionesPizza from "@/modules/math/games/GameFraccionesPizza";
import GameSumaFracciones from "@/modules/math/games/GameSumaFracciones";
import GameAcuarioDecimal from "@/modules/math/games/GameAcuarioDecimal";
import GameBarrasDatos from "@/modules/math/games/GameBarrasDatos";
import GameRelojAventurero from "@/modules/math/games/GameRelojAventurero";

import DividividiGame from "@/modules/math/games/divisiones/DividividiGame";

export default function MathShell() {
  return (
    <div className="min-h-svh p-4 sm:p-6 bg-[var(--color-background)] text-[var(--color-foreground)]">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-[var(--color-math-text)]">
          Módulo Matemáticas ➗
        </h1>

        <NavLink
          to="/"
          className="px-3 py-1 rounded-lg border bg-[var(--color-card)] border-[var(--color-card-border)] text-[var(--color-foreground)] shadow-sm"
        >
          ⬅️ Inicio
        </NavLink>
      </header>

      <nav className="mt-3 flex gap-2 text-sm">
        <NavLink
          to=""
          end
          className={({ isActive }) =>
            [
              "px-3 py-1 rounded-lg border shadow-sm transition",
              isActive
                ? "bg-[var(--color-math-border)] border-[var(--color-math-border)] text-[var(--color-math-text)]"
                : "bg-[var(--color-card)] border-[var(--color-card-border)] text-[var(--color-foreground)]",
            ].join(" ")
          }
        >
          Mapa
        </NavLink>

        <NavLink
          to="divisiones"
          className={({ isActive }) =>
            [
              "px-3 py-1 rounded-lg border shadow-sm transition",
              isActive
                ? "bg-[var(--color-math-border)] border-[var(--color-math-border)] text-[var(--color-math-text)]"
                : "bg-[var(--color-card)] border-[var(--color-card-border)] text-[var(--color-foreground)]",
            ].join(" ")
          }
        >
          Divisiones
        </NavLink>
      </nav>

      <Routes>
        <Route index element={<WorldsMap />} />

        <Route
          path="oa1"
          element={
            <BackWrap>
              <GameEscaleraNumerica />
            </BackWrap>
          }
        />
        <Route
          path="oa2"
          element={
            <BackWrap>
              <GameRayosMagicos />
            </BackWrap>
          }
        />
        <Route path="oa3" element={<ComingSoon title="OA3 · Mercado" />} />
        <Route
          path="oa8"
          element={
            <BackWrap>
              <GameFraccionesPizza />
            </BackWrap>
          }
        />
        <Route
          path="oa9"
          element={
            <BackWrap>
              <GameSumaFracciones />
            </BackWrap>
          }
        />
        <Route
          path="oa10"
          element={
            <BackWrap>
              <GameAcuarioDecimal />
            </BackWrap>
          }
        />
        <Route
          path="oa11"
          element={
            <BackWrap>
              <GameBarrasDatos />
            </BackWrap>
          }
        />
        <Route
          path="oa12"
          element={
            <BackWrap>
              <GameRelojAventurero />
            </BackWrap>
          }
        />

        <Route
          path="divisiones/dividividi"
          element={
            <BackWrap>
              <DividividiGame />
            </BackWrap>
          }
        />

        <Route path="divisiones/*" element={<DivisionShell />} />
      </Routes>
    </div>
  );
}

function BackWrap({ children }: { children: React.ReactNode }) {
  const n = useNavigate();

  return (
    <div className="relative">
      <button
        onClick={() => n("/math")}
        className="absolute top-3 right-3 z-10 px-3 py-1 rounded-lg border shadow-sm transition bg-[color:rgba(255,255,255,0.92)] border-[var(--color-card-border)] text-[var(--color-foreground)]"
      >
        Volver al mapa
      </button>

      <div className="pt-12">{children}</div>
    </div>
  );
}

function ComingSoon({ title }: { title: string }) {
  const n = useNavigate();

  return (
    <div className="max-w-3xl mx-auto mt-10 text-center space-y-4">
      <h2 className="text-2xl font-bold text-[var(--color-math-text)]">
        {title}
      </h2>

      <p className="text-[var(--color-text-secondary)]">
        Estamos preparando esta actividad para ti. ¡Muy pronto podrás
        explorarla!
      </p>

      <button
        onClick={() => n("/math")}
        className="px-4 py-2 rounded-lg border shadow-sm bg-[var(--color-card)] border-[var(--color-card-border)] text-[var(--color-foreground)]"
      >
        Volver al mapa
      </button>
    </div>
  );
}