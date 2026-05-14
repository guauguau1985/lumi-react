import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mathTopics, type MathTopic } from "@/modules/math/data/mathTopics";

// ─── Gradientes por tema ───────────────────────────────────────────────────────
const TOPIC_GRADIENT: Record<string, string> = {
  numeros:        "linear-gradient(135deg, #29b6f6 0%, #0277bd 100%)",
  multiplicacion: "linear-gradient(135deg, #ef5350 0%, #d81b60 100%)",
  division:       "linear-gradient(135deg, #26c6a0 0%, #00796b 100%)",
  fracciones:     "linear-gradient(135deg, #ba68c8 0%, #6a1b9a 100%)",
  decimales:      "linear-gradient(135deg, #ffca28 0%, #ef6c00 100%)",
  algebra:        "linear-gradient(135deg, #5c9ef0 0%, #1a3a8c 100%)",
  geometria:      "linear-gradient(135deg, #f06292 0%, #ad1457 100%)",
  medicion:       "linear-gradient(135deg, #66bb6a 0%, #2e7d32 100%)",
  datos:          "linear-gradient(135deg, #26c6da 0%, #00838f 100%)",
};

// ─── Fondo con cuadrícula ──────────────────────────────────────────────────────
const screenBg: React.CSSProperties = {
  minHeight: "100%",
  backgroundColor: "#eef6f9",
  backgroundImage:
    "linear-gradient(#c8dde8 1px, transparent 1px), linear-gradient(90deg, #c8dde8 1px, transparent 1px)",
  backgroundSize: "28px 28px",
  padding: "24px 16px 40px",
};

const MAX_STARS = 9;

// ─── Vista de detalle (lecciones) ─────────────────────────────────────────────
function LessonList({
  topic,
  onBack,
}: {
  topic: MathTopic;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const gradient = TOPIC_GRADIENT[topic.id] ?? "linear-gradient(135deg, #90a4ae, #546e7a)";
  const available = topic.lessons.filter((l) => l.status === "available").length;

  return (
    <div style={screenBg}>
      {/* Header con gradiente del tema */}
      <div
        className="rounded-2xl p-5 mb-6 relative overflow-hidden"
        style={{ background: gradient }}
      >
        <button
          onClick={onBack}
          className="text-white/80 hover:text-white text-sm flex items-center gap-1 mb-4 transition"
        >
          ← Todos los temas
        </button>
        <div className="flex items-center gap-3">
          <span
            className="text-3xl flex items-center justify-center rounded-xl shrink-0"
            style={{
              width: 52,
              height: 52,
              background: "rgba(255,255,255,0.2)",
            }}
          >
            {topic.emoji}
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-white leading-tight">
              {topic.title}
            </h2>
            <p className="text-sm text-white/80 mt-0.5">{topic.description}</p>
          </div>
        </div>
        <p className="text-xs text-white/70 mt-3">
          {available} de {topic.lessons.length} lecciones disponibles
        </p>
      </div>

      {/* Lista de lecciones */}
      <ul className="space-y-2 max-w-lg mx-auto">
        {topic.lessons.map((lesson, idx) => {
          const isLocked = lesson.status === "locked";
          const hasRoute = Boolean(lesson.route);

          return (
            <li key={lesson.id}>
              <button
                onClick={() =>
                  !isLocked && hasRoute ? navigate(lesson.route!) : undefined
                }
                disabled={isLocked || !hasRoute}
                className={[
                  "w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between gap-3",
                  isLocked
                    ? "bg-white/50 border-[#c8dde8] opacity-50 cursor-default"
                    : hasRoute
                    ? "bg-white border-[#c8dde8] hover:shadow-sm cursor-pointer"
                    : "bg-white border-[#c8dde8] opacity-70 cursor-default",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--color-text-secondary)] w-5 text-right shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {lesson.title}
                  </span>
                </div>
                <span className="text-sm shrink-0">
                  {isLocked ? "🔒" : hasRoute ? "▶" : "Pronto"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Vista principal (grid de tarjetas) ───────────────────────────────────────
export default function WorldsMap() {
  const [selected, setSelected] = useState<MathTopic | null>(null);

  if (selected) {
    return <LessonList topic={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div style={screenBg}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2
          className="text-2xl font-extrabold"
          style={{ color: "#1a3a5c" }}
        >
          ¿Hoy qué vamos a aprender? 🧠✨
        </h2>
        <p className="text-sm mt-1" style={{ color: "#4a7a9b" }}>
          Elige un tema y empieza tu aventura matemática
        </p>
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        {mathTopics.map((topic) => {
          const gradient =
            TOPIC_GRADIENT[topic.id] ??
            "linear-gradient(135deg, #90a4ae, #546e7a)";
          const total = topic.lessons.length;
          const available = topic.lessons.filter(
            (l) => l.status === "available"
          ).length;
          const progressPct = total > 0 ? (available / total) * 100 : 0;
          const stars = Math.round((available / Math.max(total, 1)) * MAX_STARS);

          return (
            <button
              key={topic.id}
              onClick={() => setSelected(topic)}
              className="text-left transition-all hover:-translate-y-0.5 active:scale-[.98]"
              style={{
                background: gradient,
                borderRadius: 20,
                padding: "14px 14px 12px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              }}
            >
              {/* Fila superior: ícono + badge estrellas */}
              <div className="flex items-start justify-between mb-3">
                <span
                  className="text-2xl flex items-center justify-center rounded-xl"
                  style={{
                    width: 44,
                    height: 44,
                    background: "rgba(255,255,255,0.22)",
                    flexShrink: 0,
                  }}
                >
                  {topic.emoji}
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{
                    background: "rgba(255,255,255,0.22)",
                    color: "white",
                    borderRadius: 99,
                    padding: "3px 8px",
                    whiteSpace: "nowrap",
                  }}
                >
                  ⭐ {stars}/{MAX_STARS}
                </span>
              </div>

              {/* Título y descripción */}
              <div className="text-sm font-bold text-white leading-tight mb-0.5">
                {topic.title}
              </div>
              <div
                className="text-xs leading-tight mb-3"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                {topic.description}
              </div>

              {/* Barra de progreso */}
              <div
                className="w-full rounded-full mb-3"
                style={{
                  height: 4,
                  background: "rgba(255,255,255,0.3)",
                }}
              >
                <div
                  className="rounded-full transition-all"
                  style={{
                    height: 4,
                    width: `${progressPct}%`,
                    background: "rgba(255,255,255,0.9)",
                  }}
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  {total} lecciones
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{
                    background: "rgba(255,255,255,0.22)",
                    color: "white",
                    borderRadius: 99,
                    padding: "3px 10px",
                  }}
                >
                  ¡Jugar! ›
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
