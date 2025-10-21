import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useProgress, type OAKey } from "@/state/progress";

const MAP_ITEMS: {
  title: string;
  items?: { oa?: OAKey; route?: string; title: string }[];
  locked?: boolean;
}[] = [
  {
    title: "Reino de los Números",
    items: [
      { oa: "OA1", route: "oa1", title: "OA1 · Escalera numérica" },
      { oa: "OA2", route: "oa2", title: "OA2 · Rayos mágicos" },
      { oa: "OA3", title: "OA3 · Mercado" }, // pronto
    ],
  },
  {
    title: "Bosque de Fracciones",
    items: [
      { oa: "OA8", route: "oa8", title: "OA8 · Pizza de fracciones" },
      { oa: "OA9", route: "oa9", title: "OA9 · Suma y resta" },
    ],
  },
  {
    title: "Mar de Decimales y Datos",
    items: [
      { oa: "OA10", route: "oa10", title: "OA10 · Acuario decimal" },
      { oa: "OA11", route: "oa11", title: "OA11 · Gráficos de barras" },
    ],
  },
  {
    title: "Cronolandia",
    items: [{ oa: "OA12", route: "oa12", title: "OA12 · Reloj aventurero" }],
  },
  // Nueva sección
  {
    title: "El arte de dividir",
    items: [{ route: "divisiones", title: "Aprende divisiones" }],
  },
  { title: "Ciudad de las Figuras", locked: true },
  { title: "Universo Medidas y Datos", locked: true },
  { title: "Isla de Patrones y Tiempo", locked: true },
];

export default function WorldsMap() {
  const navigate = useNavigate();
  const { unlocked, best } = useProgress();
  const cards = useMemo(() => MAP_ITEMS, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-extrabold text-emerald-800">Mapa de Mundos · Matemáticas</h2>
        <Button variant="ghost" onClick={() => navigate("/")}>
          Volver al inicio
        </Button>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`rounded-2xl bg-white/80 p-5 shadow border ${card.locked ? "opacity-60" : ""}`}
          >
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-slate-800">{card.title}</div>
              {card.locked ? (
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-500">Bloqueado</span>
              ) : null}
            </div>

            {!card.locked && card.items ? (
              <ul className="mt-3 space-y-2">
                {card.items.map((item, idx) => {
                  const isAvailable = Boolean(item.route);
                  const isUnlocked = item.oa ? Boolean(unlocked[item.oa]) : true;
                  const disabled = !isUnlocked || !isAvailable;

                  const bestScore = item.oa ? best[item.oa] ?? 0 : 0;
                  const suffix = bestScore > 0 ? ` · Mejor ${bestScore}` : "";
                  const status = !isAvailable
                    ? "Pronto"
                    : !isUnlocked
                      ? "🔒"
                      : suffix || "Listo";

                  return (
                    <li key={`${card.title}-${idx}`}>
                      <Button
                        variant="ghost"
                        className="w-full justify-between"
                        onClick={() => item.route && navigate(item.route)}
                        disabled={disabled}
                      >
                        <span>{item.title}</span>
                        <span className="text-sm text-slate-500">{status}</span>
                      </Button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

