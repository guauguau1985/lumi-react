import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mathTopics, type MathTopic } from "@/modules/math/data/mathTopics";

// ─── Gradientes por tema ───────────────────────────────────────────────────────
const TOPIC_GRADIENT: Record<string, string> = {
  numeros:        "linear-gradient(145deg, #42c8f5 0%, #1a7fc4 100%)",
  multiplicacion: "linear-gradient(145deg, #f4706b 0%, #d4237a 100%)",
  division:       "linear-gradient(145deg, #34d9b0 0%, #05907a 100%)",
  fracciones:     "linear-gradient(145deg, #c97de0 0%, #7520b0 100%)",
  decimales:      "linear-gradient(145deg, #ffc93c 0%, #e86b00 100%)",
  algebra:        "linear-gradient(145deg, #6aaef6 0%, #1d4aaa 100%)",
  geometria:      "linear-gradient(145deg, #f47aaa 0%, #b5196a 100%)",
  medicion:       "linear-gradient(145deg, #5ecf72 0%, #1f7a35 100%)",
  datos:          "linear-gradient(145deg, #34d6e8 0%, #00869a 100%)",
};

const FALLBACK_GRADIENT = "linear-gradient(145deg, #a0b4c8, #5a7080)";
const MAX_STARS = 9;

// ─── Fondo degradado suave ─────────────────────────────────────────────────────
const pageBg: React.CSSProperties = {
  minHeight: "100%",
  background:
    "linear-gradient(135deg, #b6f0e4 0%, #d8eef8 40%, #e4d2f4 80%, #fce4ec 100%)",
};

// ─── Vista de detalle: lista de lecciones ─────────────────────────────────────
function LessonList({ topic, onBack }: { topic: MathTopic; onBack: () => void }) {
  const navigate = useNavigate();
  const gradient = TOPIC_GRADIENT[topic.id] ?? FALLBACK_GRADIENT;
  const available = topic.lessons.filter((l) => l.status === "available").length;

  return (
    <div style={pageBg} className="px-4 py-6 sm:px-6 sm:py-8 pb-16">
      <div className="max-w-lg mx-auto">
        {/* Encabezado con gradiente del tema */}
        <div
          className="rounded-3xl p-5 sm:p-6 mb-6 overflow-hidden"
          style={{ background: gradient, boxShadow: "0 6px 24px rgba(0,0,0,0.18)" }}
        >
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm font-medium mb-4 sm:mb-5 transition"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            ← Todos los temas
          </button>

          <div className="flex items-center gap-3 sm:gap-4">
            <span
              className="text-3xl sm:text-4xl flex items-center justify-center rounded-2xl shrink-0"
              style={{ width: 52, height: 52, background: "rgba(255,255,255,0.22)" }}
            >
              {topic.emoji}
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                {topic.title}
              </h2>
              <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.8)" }}>
                {topic.description}
              </p>
            </div>
          </div>

          <p className="text-xs mt-3 sm:mt-4" style={{ color: "rgba(255,255,255,0.7)" }}>
            {available} de {topic.lessons.length} lecciones disponibles
          </p>
        </div>

        {/* Lista de lecciones */}
        <ul className="space-y-2">
          {topic.lessons.map((lesson, idx) => {
            const isLocked = lesson.status === "locked";
            const hasRoute = Boolean(lesson.route);
            const clickable = !isLocked && hasRoute;

            return (
              <li key={lesson.id}>
                <button
                  onClick={() => clickable && navigate(lesson.route!)}
                  disabled={!clickable}
                  className="w-full text-left flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border transition-all"
                  style={{
                    background: isLocked ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.92)",
                    borderColor: "rgba(200,220,240,0.7)",
                    boxShadow: clickable ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                    opacity: isLocked ? 0.55 : 1,
                    cursor: clickable ? "pointer" : "default",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shrink-0"
                      style={{ background: "rgba(0,0,0,0.06)", color: "#555" }}
                    >
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
    </div>
  );
}

// ─── Vista principal: grid de tarjetas ────────────────────────────────────────
export default function WorldsMap() {
  const [selected, setSelected] = useState<MathTopic | null>(null);
  const [search, setSearch] = useState("");

  if (selected) {
    return <LessonList topic={selected} onBack={() => setSelected(null)} />;
  }

  const filtered = search.trim()
    ? mathTopics.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.description.toLowerCase().includes(search.toLowerCase())
      )
    : mathTopics;

  return (
    <div style={pageBg} className="px-4 py-6 sm:px-6 sm:py-8 pb-16">
      {/* ── Header ── */}
      <div className="text-center mb-5 sm:mb-6">
        <h2
          className="text-2xl sm:text-3xl font-extrabold"
          style={{ color: "#1a2f4a" }}
        >
          ¿Qué vamos a aprender hoy?
        </h2>
        <p className="text-sm sm:text-base mt-1" style={{ color: "#4a6a88" }}>
          Elige un tema y comienza tu aventura matemática
        </p>
      </div>

      {/* ── Buscador ── */}
      <div className="max-w-md mx-auto mb-6 sm:mb-8">
        <div className="relative">
          <span
            className="absolute left-4 top-1/2 -translate-y-1/2 text-base select-none pointer-events-none"
            style={{ color: "#9ab" }}
          >
            🔍
          </span>
          <input
            type="text"
            placeholder="Buscar tema…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none text-sm"
            style={{
              padding: "12px 18px 12px 42px",
              borderRadius: 99,
              border: "none",
              background: "rgba(255,255,255,0.88)",
              boxShadow: "0 2px 20px rgba(0,0,0,0.10)",
              color: "#2a3a4a",
            }}
          />
        </div>
      </div>

      {/* ── Grid responsivo ──
           móvil  (<640px) : 1 columna
           tablet (≥640px) : 2 columnas
           desktop(≥1024px): 3 columnas   ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {filtered.map((topic) => {
          const gradient = TOPIC_GRADIENT[topic.id] ?? FALLBACK_GRADIENT;
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
              className="text-left transition-all duration-200 hover:-translate-y-1 active:scale-[.97] w-full"
              style={{
                background: gradient,
                borderRadius: 22,
                padding: "16px 16px 14px",
                boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
                minHeight: 160,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Ícono + badge estrellas */}
              <div className="flex items-start justify-between mb-auto">
                <span
                  className="flex items-center justify-center rounded-xl shrink-0"
                  style={{
                    width: 46,
                    height: 46,
                    background: "rgba(255,255,255,0.25)",
                    fontSize: 22,
                  }}
                >
                  {topic.emoji}
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{
                    background: "rgba(255,255,255,0.25)",
                    color: "rgba(255,255,255,0.95)",
                    borderRadius: 99,
                    padding: "4px 9px",
                    whiteSpace: "nowrap",
                  }}
                >
                  ⭐ {stars}/{MAX_STARS}
                </span>
              </div>

              {/* Título y descripción */}
              <div className="mt-3">
                <div className="text-sm font-extrabold text-white leading-snug">
                  {topic.title}
                </div>
                <div
                  className="text-xs mt-0.5 leading-snug"
                  style={{ color: "rgba(255,255,255,0.78)" }}
                >
                  {topic.description}
                </div>
              </div>

              {/* Barra de progreso */}
              <div
                className="w-full rounded-full mt-3 mb-2"
                style={{ height: 3, background: "rgba(255,255,255,0.28)" }}
              >
                <div
                  className="rounded-full transition-all"
                  style={{
                    height: 3,
                    width: `${progressPct}%`,
                    background: "rgba(255,255,255,0.92)",
                  }}
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.72)" }}>
                  {total} lecciones
                </span>
                <span
                  className="text-xs font-bold"
                  style={{
                    background: "rgba(255,255,255,0.25)",
                    color: "white",
                    borderRadius: 99,
                    padding: "4px 11px",
                  }}
                >
                  ¡Jugar! ›
                </span>
              </div>
            </button>
          );
        })}

        {/* Sin resultados */}
        {filtered.length === 0 && (
          <div
            className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-12"
            style={{ color: "#6a8a9a" }}
          >
            No se encontraron temas para &ldquo;{search}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
}
