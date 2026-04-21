import { NavLink, Routes, Route } from "react-router-dom";
import EcoHome from "@/modules/eco/pages/EcoHome";
import EcoSorter from "@/modules/eco/pages/EcoSorter";
import FootprintQuiz from "@/modules/eco/pages/FootprintQuiz";
import CompostLab from "@/modules/eco/pages/CompostLab";

export default function EcoShell() {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    [
      "px-3 py-1 rounded-lg border transition shadow-sm",
      isActive
        ? "bg-[var(--color-eco-border)] border-[var(--color-eco-border)] text-[var(--color-eco-text)]"
        : "bg-[var(--color-surface)] border-[var(--color-card-border)] text-[var(--color-foreground)]",
    ].join(" ");

  return (
    <div className="min-h-svh p-4 sm:p-6 lg:p-8 bg-[var(--color-background)] text-[var(--color-foreground)]">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-[var(--color-eco-text)]">
          Módulo Eco ♻️
        </h1>

        <NavLink
          to="/"
          className="px-3 py-1 rounded-lg border shadow-sm bg-[var(--color-surface)] text-[var(--color-foreground)] border-[var(--color-card-border)]"
        >
          ⬅️ Inicio
        </NavLink>
      </header>

      <nav className="mt-3 flex gap-2 text-sm">
        <NavLink to="" end className={navClass}>
          Inicio
        </NavLink>

        <NavLink to="sorter" className={navClass}>
          Clasificador
        </NavLink>

        <NavLink to="huella" className={navClass}>
          Quiz
        </NavLink>

        <NavLink to="compost" className={navClass}>
          Compost
        </NavLink>
      </nav>

      <Routes>
        <Route index element={<EcoHome />} />
        <Route path="sorter" element={<EcoSorter />} />
        <Route path="huella" element={<FootprintQuiz />} />
        <Route path="compost" element={<CompostLab />} />
      </Routes>
    </div>
  );
}