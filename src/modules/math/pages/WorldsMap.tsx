import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mathTopics, type MathTopic } from "@/modules/math/data/mathTopics";

export default function WorldsMap() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<MathTopic | null>(null);

  if (selected) {
    const availableCount = selected.lessons.filter(
      (l) => l.status === "available"
    ).length;

    return (
      <div className="max-w-lg mx-auto p-4">
        <button
          onClick={() => setSelected(null)}
          className="mb-5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition flex items-center gap-1"
        >
          ← Todos los temas
        </button>

        <div className="flex items-center gap-3 mb-1">
          <span className="text-4xl">{selected.emoji}</span>
          <h2 className="text-xl font-extrabold text-[var(--color-math-text)]">
            {selected.title}
          </h2>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] mb-2 ml-14">
          {selected.description}
        </p>
        <p className="text-xs text-[var(--color-text-secondary)] mb-5 ml-14">
          {availableCount} de {selected.lessons.length} lecciones disponibles
        </p>

        <ul className="space-y-2">
          {selected.lessons.map((lesson, idx) => {
            const isLocked = lesson.status === "locked";
            const hasRoute = Boolean(lesson.route);

            return (
              <li key={lesson.id}>
                <button
                  onClick={() =>
                    !isLocked && hasRoute
                      ? navigate(lesson.route!)
                      : undefined
                  }
                  disabled={isLocked || !hasRoute}
                  className={[
                    "w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between gap-3",
                    isLocked
                      ? "bg-[var(--color-muted)] border-[var(--color-card-border)] opacity-50 cursor-default"
                      : hasRoute
                      ? "bg-[var(--color-card)] border-[var(--color-card-border)] hover:shadow-sm cursor-pointer"
                      : "bg-[var(--color-card)] border-[var(--color-card-border)] opacity-70 cursor-default",
                  ].join(" ")}
                  style={
                    !isLocked && hasRoute
                      ? { boxShadow: "var(--shadow-card)" }
                      : undefined
                  }
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

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-extrabold text-[var(--color-math-text)] mb-6">
        ¿Hoy qué vamos a aprender?
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {mathTopics.map((topic) => {
          const total = topic.lessons.length;
          const available = topic.lessons.filter(
            (l) => l.status === "available"
          ).length;
          const progressPct = total > 0 ? (available / total) * 100 : 0;

          return (
            <button
              key={topic.id}
              onClick={() => setSelected(topic)}
              className="rounded-2xl p-5 border text-left transition-all bg-[var(--color-card)] border-[var(--color-card-border)] hover:shadow-md cursor-pointer"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="text-3xl text-center mb-2">{topic.emoji}</div>

              <div className="text-sm font-bold text-[var(--color-text-primary)] text-center leading-tight mb-1">
                {topic.title}
              </div>

              <div className="text-xs text-[var(--color-text-secondary)] text-center mb-3">
                {topic.description}
              </div>

              <div className="w-full bg-[var(--color-muted)] rounded-full h-1.5 mb-1">
                <div
                  className="bg-[var(--color-math-text)] h-1.5 rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <div className="text-xs text-[var(--color-text-secondary)] text-center">
                {available}/{total} lecciones
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
