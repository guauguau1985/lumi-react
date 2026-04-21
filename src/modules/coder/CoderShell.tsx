// src/modules/coder/CoderShell.tsx
import { NavLink, Routes, Route } from "react-router-dom";

function CoderHome() {
  return (
    <div
      className="mt-4 rounded-2xl border p-5 bg-[var(--color-card)] border-[var(--color-card-border)]"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <p className="text-[var(--color-foreground)]">
        Pronto: secuencias, bucles y condicionales con Lumi 👩‍💻
      </p>
    </div>
  );
}

export default function CoderShell() {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    [
      "px-3 py-1 rounded-lg border transition shadow-sm",
      isActive
        ? "bg-[var(--color-coder-border)] border-[var(--color-coder-border)] text-[var(--color-coder-text)]"
        : "bg-[var(--color-surface)] border-[var(--color-card-border)] text-[var(--color-foreground)]",
    ].join(" ");

  return (
    <div className="min-h-svh p-4 sm:p-6 bg-[var(--color-background)] text-[var(--color-foreground)]">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-[var(--color-coder-text)]">
          Módulo Programador
        </h1>

        <NavLink
          to="/"
          className="px-3 py-1 rounded-lg border shadow-sm bg-[var(--color-surface)] border-[var(--color-card-border)] text-[var(--color-foreground)]"
        >
          ⬅️ Inicio
        </NavLink>
      </header>

      <nav className="mt-3 flex gap-2 text-sm">
        <NavLink to="" end className={navClass}>
          Inicio
        </NavLink>
      </nav>

      <Routes>
        <Route index element={<CoderHome />} />
      </Routes>
    </div>
  );
}