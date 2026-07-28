import { Link, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/Card";
import EcoSorter from "@/modules/eco/pages/EcoSorter";
import FootprintQuiz from "@/modules/eco/pages/FootprintQuiz";
import CompostLab from "@/modules/eco/games/CompostLab";

function EcoLanding() {
  const cards = [
    { to: "sorter", title: "Clasificador de Reciclaje", subtitle: "Arrastra cada objeto al contenedor correcto." },
    { to: "huella", title: "Quiz Huella Verde",        subtitle: "Elige la mejor opción para cuidar el planeta." },
    { to: "compost", title: "Laboratorio de Compost",  subtitle: "Aprende qué va y qué no va al compost." },
  ];

  return (
    <main className="min-h-svh p-4 sm:p-6 bg-gradient-to-br from-emerald-50 to-sky-50">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-700">Módulo Eco ♻️</h1>
        <NavLink
          to="/"
          className="px-3 py-1 rounded-lg border shadow-sm bg-white border-emerald-200 text-emerald-700"
        >
          ⬅️ Inicio
        </NavLink>
      </header>
      <p className="text-gray-600 mt-1">Reciclaje, ecología y sustentabilidad.</p>

      <div className="grid gap-4 sm:grid-cols-3 mt-6">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="focus:outline-none">
            <Card className="h-full">
              <CardHeader title={c.title} />
              <CardContent>
                <p className="text-sm text-gray-600">{c.subtitle}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}

function BackToEco({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => navigate("/eco")}
        className="absolute top-3 right-3 sm:top-4 sm:right-6 z-10 px-3 py-1 rounded-lg border shadow-sm bg-white/90 border-emerald-200 text-emerald-700 text-sm font-semibold"
      >
        ⬅️ Volver
      </button>
      {children}
    </div>
  );
}

export default function EcoHome() {
  return (
    <Routes>
      <Route index element={<EcoLanding />} />
      <Route path="sorter" element={<BackToEco><EcoSorter /></BackToEco>} />
      <Route path="huella" element={<BackToEco><FootprintQuiz /></BackToEco>} />
      <Route path="compost" element={<BackToEco><CompostLab /></BackToEco>} />
    </Routes>
  );
}
