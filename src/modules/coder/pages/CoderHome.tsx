import { Link, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/Card";
import AtrapaError from "@/modules/coder/games/AtrapaError";
import CarreraLumi from "@/modules/coder/games/CarreraLumi";
import CaminoComandos from "@/modules/coder/games/CaminoComandos";

function CoderLanding() {
  const cards = [
    { to: "atrapa-error", title: "🔧 Atrapa el Error", subtitle: "Encuentra el paso incorrecto en el circuito." },
    { to: "carrera-lumi", title: "🏁 Carrera de Lumi", subtitle: "Responde tablas de multiplicar y avanza." },
    { to: "camino-comandos", title: "🧭 Camino de Comandos", subtitle: "Programa los movimientos de Lumi." },
  ];

  return (
    <main className="min-h-svh p-4 sm:p-6 bg-[var(--color-background)] text-[var(--color-foreground)]">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-coder-text)]">
          Módulo Programación 💻
        </h1>
        <NavLink
          to="/"
          className="px-3 py-1 rounded-lg border shadow-sm bg-[var(--color-surface)] border-[var(--color-coder-border)] text-[var(--color-coder-text)]"
        >
          ⬅️ Inicio
        </NavLink>
      </header>
      <p className="text-[var(--color-muted-foreground)] mt-1">
        Pensamiento computacional y lógica de programación.
      </p>

      <div className="grid gap-4 sm:grid-cols-3 mt-6">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="focus:outline-none">
            <Card className="h-full">
              <CardHeader title={c.title} />
              <CardContent>
                <p className="text-sm text-[var(--color-muted-foreground)]">{c.subtitle}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}

function BackToCoder({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => navigate("/coder")}
        className="absolute top-3 right-3 sm:top-4 sm:right-6 z-10 px-3 py-1 rounded-lg border shadow-sm bg-white/90 border-[var(--color-coder-border)] text-[var(--color-coder-text)] text-sm font-semibold"
      >
        ⬅️ Volver
      </button>
      {children}
    </div>
  );
}

export default function CoderHome() {
  return (
    <Routes>
      <Route index element={<CoderLanding />} />
      <Route path="atrapa-error" element={<BackToCoder><AtrapaError /></BackToCoder>} />
      <Route path="carrera-lumi" element={<BackToCoder><CarreraLumi /></BackToCoder>} />
      <Route path="camino-comandos" element={<BackToCoder><CaminoComandos /></BackToCoder>} />
    </Routes>
  );
}
