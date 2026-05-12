import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useProgress, type OAKey } from "@/state/progress";

const MAX_STARS = 9;

const TOPICS: {
  icon: string;
  title: string;
  description: string;
  oa?: OAKey;
  route?: string;
}[] = [
  {
    icon: "🔢",
    title: "Números y orden",
    description: "Ordena, compara y ubica números",
    oa: "OA1",
    route: "oa1",
  },
  {
    icon: "📏",
    title: "Recta numérica",
    description: "Representa números en la recta",
    oa: "OA2",
    route: "oa2",
  },
  {
    icon: "🍕",
    title: "Fracciones",
    description: "Partes de un todo",
    oa: "OA8",
    route: "oa8",
  },
  {
    icon: "➕",
    title: "Suma y resta de fracciones",
    description: "Opera con fracciones",
    oa: "OA9",
    route: "oa9",
  },
  {
    icon: "💧",
    title: "Decimales",
    description: "Números con coma",
    oa: "OA10",
    route: "oa10",
  },
  {
    icon: "📊",
    title: "Gráficos y datos",
    description: "Lee e interpreta gráficos",
    oa: "OA11",
    route: "oa11",
  },
  {
    icon: "🕐",
    title: "Medición del tiempo",
    description: "Horas, minutos y calendarios",
    oa: "OA12",
    route: "oa12",
  },
  {
    icon: "➗",
    title: "División",
    description: "Reparte y divide",
    route: "divisiones/dividividi",
  },
];

export default function WorldsMap() {
  const navigate = useNavigate();
  const { unlocked, best } = useProgress();
  const topics = useMemo(() => TOPICS, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-extrabold text-[var(--color-math-text)] mb-6">
        ¿Hoy qué vamos a aprender?
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {topics.map((topic) => {
          const isUnlocked = topic.oa ? Boolean(unlocked[topic.oa]) : true;
          const score = topic.oa ? (best[topic.oa] ?? 0) : 0;
          const stars = Math.round((score / 100) * MAX_STARS);

          return (
            <button
              key={topic.title}
              onClick={() => isUnlocked && topic.route && navigate(topic.route)}
              disabled={!isUnlocked || !topic.route}
              className={[
                "rounded-2xl p-5 border text-left transition-all",
                isUnlocked
                  ? "bg-[var(--color-card)] border-[var(--color-card-border)] hover:shadow-md cursor-pointer"
                  : "bg-[var(--color-muted)] border-[var(--color-card-border)] opacity-60 cursor-default",
              ].join(" ")}
              style={
                isUnlocked ? { boxShadow: "var(--shadow-card)" } : undefined
              }
            >
              <div className="text-3xl text-center mb-2">
                {isUnlocked ? topic.icon : "🔒"}
              </div>

              <div className="text-sm font-bold text-[var(--color-text-primary)] text-center leading-tight mb-1">
                {topic.title}
              </div>

              <div className="text-xs text-[var(--color-text-secondary)] text-center mb-3">
                {topic.description}
              </div>

              <div className="w-full bg-[var(--color-muted)] rounded-full h-1.5 mb-2">
                <div
                  className="bg-[var(--color-math-text)] h-1.5 rounded-full transition-all"
                  style={{ width: `${score}%` }}
                />
              </div>

              <div className="text-xs text-[var(--color-text-secondary)] text-center">
                ★ {stars}/{MAX_STARS}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
