import { type ReactNode, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAdaptiveLearning } from "@/hooks/useAdaptiveLearning";
import { useGameRewards } from "@/gamification/useGameRewards";
import { useFeedback } from "@/hooks/useFeedback";
import Feedback from "@/components/Feedback";

type LessonId = "agua" | "estados" | "ciclo";
type LessonPhase = "intro" | "section" | "quiz";

type LessonStatus = "available" | "locked" | "completed";

type LessonItem = {
  id: LessonId;
  title: string;
  status: LessonStatus;
};

type Question = {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

type LessonSection = {
  title: string;
  emoji: string;
  gradient: string;
  body: ReactNode;
};

const LESSONS: LessonItem[] = [
  { id: "agua", title: "💧 Agua dulce y agua salada", status: "available" },
  { id: "estados", title: "❄️ Estados del agua", status: "locked" },
  { id: "ciclo", title: "☁️ El ciclo del agua", status: "locked" },
];

const QUESTIONS: Question[] = [
  {
    question: "¿Qué porcentaje del agua del planeta es agua salada?",
    options: ["3%", "50%", "97%", "79%"],
    correct: 2,
    explanation:
      "El 97% del agua del planeta es salada (océanos y mares). Solo el 3% es dulce.",
  },
  {
    question: "¿Dónde se encuentra la mayor reserva de agua dulce?",
    options: ["Ríos", "Lagos", "Nubes", "Glaciares y casquetes polares"],
    correct: 3,
    explanation:
      "El 79% del agua dulce está en glaciares y casquetes polares.",
  },
  {
    question: "¿Cuál de estas masas de agua es salada?",
    options: ["Ríos", "Lagos", "Océanos", "Nubes"],
    correct: 2,
    explanation: "Los océanos son grandes masas de agua salada.",
  },
  {
    question: "¿En cuántos estados encontramos el agua en la Tierra?",
    options: ["1", "2", "3", "4"],
    correct: 2,
    explanation:
      "El agua aparece en estado sólido, líquido y gaseoso.",
  },
  {
    question: "¿Qué son las aguas subterráneas?",
    options: [
      "Agua en las nubes",
      "Agua acumulada bajo la superficie",
      "Agua del océano profundo",
      "Hielo de los polos",
    ],
    correct: 1,
    explanation:
      "Las aguas subterráneas se forman por filtración y se acumulan bajo la tierra.",
  },
];

const Bar = ({
  emoji,
  label,
  pct,
}: {
  emoji: string;
  label: string;
  pct: number;
}) => (
  <div className="bg-white/25 rounded-xl p-2 backdrop-blur-sm">
    <div className="flex justify-between text-sm font-bold mb-1">
      <span>
        {emoji} {label}
      </span>
      <span>{pct}%</span>
    </div>
    <div className="h-3 bg-white/30 rounded-full overflow-hidden">
      <div
        className="h-full bg-white rounded-full transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  </div>
);

const Item = ({
  emoji,
  title,
  text,
}: {
  emoji: string;
  title: string;
  text: string;
}) => (
  <div className="bg-white/25 rounded-xl p-3 mb-2 backdrop-blur-sm flex gap-3">
    <div className="text-3xl">{emoji}</div>
    <div>
      <p className="font-extrabold">{title}</p>
      <p className="text-sm opacity-90">{text}</p>
    </div>
  </div>
);

const Row = ({ k, a, b }: { k: string; a: string; b: string }) => (
  <div className="grid grid-cols-3 p-2 border-t border-white/30">
    <div className="font-bold">{k}</div>
    <div className="text-center">{a}</div>
    <div className="text-center">{b}</div>
  </div>
);

const SECTIONS: LessonSection[] = [
  {
    title: "¿Qué es la Hidrósfera? 🌍",
    emoji: "🌍",
    gradient: "from-sky-400 via-cyan-400 to-blue-400",
    body: (
      <>
        <p>
          La <b>Hidrósfera</b> es la capa de <b>agua</b> que cubre nuestro
          planeta. El agua aparece en tres estados.
        </p>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/30 rounded-2xl p-3 text-center backdrop-blur-sm">
            <div className="text-4xl">🧊</div>
            <p className="font-bold mt-1 text-sm">Sólido</p>
            <p className="text-xs opacity-90">Hielo y glaciares</p>
          </div>
          <div className="bg-white/30 rounded-2xl p-3 text-center backdrop-blur-sm">
            <div className="text-4xl">💧</div>
            <p className="font-bold mt-1 text-sm">Líquido</p>
            <p className="text-xs opacity-90">Ríos, mares, lagos</p>
          </div>
          <div className="bg-white/30 rounded-2xl p-3 text-center backdrop-blur-sm">
            <div className="text-4xl">☁️</div>
            <p className="font-bold mt-1 text-sm">Gaseoso</p>
            <p className="text-xs opacity-90">Vapor de agua</p>
          </div>
        </div>
      </>
    ),
  },
  {
    title: "💧 Agua dulce vs 🌊 Agua salada",
    emoji: "⚖️",
    gradient: "from-emerald-400 via-cyan-400 to-blue-500",
    body: (
      <>
        <p>El agua del planeta se divide en dos grupos principales.</p>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/30 rounded-2xl p-4 backdrop-blur-sm">
            <div className="text-5xl text-center">💧</div>
            <p className="font-extrabold text-center mt-2">Agua dulce</p>
            <p className="text-center text-3xl font-extrabold">3%</p>
            <p className="text-xs text-center opacity-90">Ríos, lagos, glaciares</p>
          </div>
          <div className="bg-white/30 rounded-2xl p-4 backdrop-blur-sm">
            <div className="text-5xl text-center">🌊</div>
            <p className="font-extrabold text-center mt-2">Agua salada</p>
            <p className="text-center text-3xl font-extrabold">97%</p>
            <p className="text-xs text-center opacity-90">Océanos y mares</p>
          </div>
        </div>
      </>
    ),
  },
  {
    title: "🧊 ¿Dónde está el agua dulce?",
    emoji: "🧊",
    gradient: "from-cyan-300 via-sky-400 to-indigo-400",
    body: (
      <>
        <div className="space-y-2 mt-3">
          <Bar emoji="🧊" label="Glaciares y casquetes" pct={79} />
          <Bar emoji="🪨" label="Aguas subterráneas" pct={20} />
          <Bar emoji="🏞️" label="Ríos y lagos" pct={1} />
        </div>
        <p className="mt-4 text-sm bg-white/20 rounded-xl p-3">
          ❄️ Los glaciares son la mayor reserva de agua dulce del planeta.
        </p>
      </>
    ),
  },
  {
    title: "🌊 Océanos, mares y lagos",
    emoji: "🌊",
    gradient: "from-blue-500 via-cyan-500 to-teal-400",
    body: (
      <>
        <Item
          emoji="🌊"
          title="Océanos"
          text="Grandes masas de agua salada que separan continentes."
        />
        <Item
          emoji="🏖️"
          title="Mares"
          text="Aguas saladas cercanas a las costas."
        />
        <Item
          emoji="🏞️"
          title="Lagos y ríos"
          text="Fuentes principales de agua dulce para la vida."
        />
        <Item
          emoji="🪨"
          title="Aguas subterráneas"
          text="Agua que se filtra y queda bajo la tierra."
        />
      </>
    ),
  },
  {
    title: "🔍 Diferencias clave",
    emoji: "🔬",
    gradient: "from-teal-400 via-emerald-400 to-lime-400",
    body: (
      <div className="bg-white/30 rounded-2xl overflow-hidden backdrop-blur-sm text-sm">
        <div className="grid grid-cols-3 font-extrabold bg-white/30 p-2">
          <div>Característica</div>
          <div className="text-center">🌊 Salada</div>
          <div className="text-center">💧 Dulce</div>
        </div>
        <Row k="Salinidad" a="Mucha sal" b="Casi sin sal" />
        <Row k="Cantidad" a="97% del planeta" b="3% del planeta" />
        <Row k="Usos" a="Pesca, navegación" b="Beber, riego, industria" />
      </div>
    ),
  },
];

function AguaDulceSaladaLesson({
  onBack,
  onComplete,
}: {
  onBack: () => void;
  onComplete: (score: number) => void;
}) {
  const [phase, setPhase] = useState<LessonPhase>("intro");
  const [sectionStep, setSectionStep] = useState(0);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const { profile, onCorrect, onWrong, onGameCompleted } = useGameRewards(
    "educacionAmbiental",
    "naturales-agua-dulce-salada"
  );
  const { state: adaptive, recordAnswer } = useAdaptiveLearning(1);
  const { feedback, markCorrect, markWrong } = useFeedback();

  const current = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;
  const currentSection = SECTIONS[sectionStep];
  const isLastSection = sectionStep === SECTIONS.length - 1;

  const reinforcementText =
    adaptive.reinforcement === "review-short"
      ? "💡 Pista: recuerda, el agua dulce es poca (3%) y la salada mucha (97%)."
      : adaptive.reinforcement === "review-simple"
      ? "📘 Repaso: salada = océanos y mares; dulce = ríos, lagos y glaciares."
      : null;

  const handleOption = (optionIndex: number) => {
    if (showFeedback) return;
    setSelected(optionIndex);
    setShowFeedback(true);
    const isCorrect = optionIndex === current.correct;
    recordAnswer(isCorrect);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      onCorrect();
      markCorrect();
    } else {
      onWrong();
      markWrong();
    }
  };

  const handleNext = () => {
    if (isLast) {
      const finalScore = selected === current.correct ? score : score;
      onGameCompleted();
      onComplete(finalScore);
      return;
    }

    setStep((prev) => prev + 1);
    setSelected(null);
    setShowFeedback(false);
  };

  if (phase === "intro") {
    return (
      <div className="px-4 py-8 max-w-3xl mx-auto">
        <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-sky-400 via-cyan-400 to-emerald-400 text-slate-900 p-6 sm:p-10 shadow-xl relative">
          <div className="absolute top-2 right-4 text-7xl opacity-30 select-none">🌊</div>
          <div className="absolute bottom-2 left-4 text-5xl opacity-30 select-none">💧</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold drop-shadow-sm">
            💧 Agua dulce y agua salada
          </h2>
          <p className="mt-3 text-base sm:text-lg font-semibold opacity-90">
            Descubre cómo se distribuye el agua en nuestro planeta.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setPhase("section")}
              className="bg-white text-slate-900 font-extrabold px-6 py-3 rounded-2xl shadow-md hover:scale-105 transition-transform"
            >
              Empezar repaso
            </button>
            <button
              type="button"
              onClick={onBack}
              className="bg-white/30 backdrop-blur-sm font-bold px-6 py-3 rounded-2xl hover:bg-white/40 transition"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "section") {
    return (
      <div className="px-4 py-6 max-w-3xl mx-auto">
        <div
          className={`rounded-3xl overflow-hidden bg-gradient-to-br ${currentSection.gradient} text-slate-900 p-6 sm:p-8 shadow-xl relative`}
        >
          <div className="absolute top-2 right-4 text-7xl opacity-25 select-none">
            {currentSection.emoji}
          </div>
          <div className="text-xs font-bold uppercase tracking-wide opacity-80">
            Paso {sectionStep + 1} de {SECTIONS.length}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 drop-shadow-sm">
            {currentSection.title}
          </h2>

          <div className="flex gap-1.5 mt-3">
            {SECTIONS.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  index <= sectionStep ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>

          <div className="mt-5 text-base sm:text-lg leading-relaxed relative z-10">
            {currentSection.body}
          </div>
        </div>

        <div className="flex justify-between gap-3 mt-5">
          <button
            type="button"
            onClick={() =>
              sectionStep === 0 ? setPhase("intro") : setSectionStep((prev) => prev - 1)
            }
            className="bg-[var(--color-card)] border border-[var(--color-card-border)] font-bold px-5 py-3 rounded-2xl hover:bg-[var(--color-muted)] transition"
          >
            Anterior
          </button>
          {isLastSection ? (
            <button
              type="button"
              onClick={() => setPhase("quiz")}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-extrabold px-6 py-3 rounded-2xl shadow-md hover:scale-105 transition-transform"
            >
              ¡A practicar!
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSectionStep((prev) => prev + 1)}
              className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-extrabold px-6 py-3 rounded-2xl shadow-md hover:scale-105 transition-transform"
            >
              Siguiente
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-6 rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-surface)] p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-extrabold text-sky-700">
          💧 Agua dulce y agua salada
        </h2>
        <button
          type="button"
          onClick={() => setPhase("section")}
          className="rounded-lg border border-[var(--color-card-border)] px-3 py-1 text-sm"
        >
          Volver al repaso
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs">
        <span className="rounded-full bg-sky-100 px-2 py-1 text-sky-700">
          Nivel adaptativo: {adaptive.currentLevel}
        </span>
        <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">
          Aciertos: {adaptive.accuracy}%
        </span>
        <span className="rounded-full bg-indigo-100 px-2 py-1 text-indigo-700">
          Lumi nivel: {profile.nivel}
        </span>
      </div>

      <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
        Pregunta {step + 1} de {QUESTIONS.length}
      </p>
      <p className="mt-2 text-base font-semibold text-[var(--color-text-primary)]">
        {current.question}
      </p>

      <div className="mt-4 grid gap-2">
        {current.options.map((option, index) => {
          const isCorrect = showFeedback && index === current.correct;
          const isWrongSelected =
            showFeedback && selected === index && index !== current.correct;

          return (
            <button
              key={`${option}-${index}`}
              type="button"
              onClick={() => handleOption(index)}
              className={[
                "rounded-xl border px-3 py-2 text-left text-sm transition",
                isCorrect
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                  : isWrongSelected
                  ? "border-red-400 bg-red-50 text-red-700"
                  : "border-[var(--color-card-border)] bg-white hover:bg-slate-50",
              ].join(" ")}
            >
              {option}
            </button>
          );
        })}
      </div>

      {reinforcementText && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {reinforcementText}
        </p>
      )}

      {showFeedback && (
        <p className="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-800">
          {current.explanation}
        </p>
      )}

      <div className="mt-4">
        <button
          type="button"
          onClick={handleNext}
          disabled={!showFeedback}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLast ? "Finalizar lección" : "Siguiente"}
        </button>
      </div>

      <Feedback
        state={feedback}
        successText="¡Respuesta correcta!"
        errorText="Casi, vamos de nuevo"
      />
    </div>
  );
}

export default function NaturalesShell() {
  const [activeLesson, setActiveLesson] = useState<LessonId | null>(null);
  const [completedStars, setCompletedStars] = useState<Record<string, number>>(
    {}
  );

  const lessonCards = useMemo(() => LESSONS, []);

  const handleComplete = (id: LessonId, score: number) => {
    const total = QUESTIONS.length;
    const stars = score >= total - 1 ? 3 : score >= total - 2 ? 2 : score >= 1 ? 1 : 0;
    setCompletedStars((prev) => ({
      ...prev,
      [id]: Math.max(prev[id] || 0, stars),
    }));
    setActiveLesson(null);
  };

  if (activeLesson === "agua") {
    return (
      <div className="min-h-svh p-4 sm:p-6 bg-[var(--color-background)] text-[var(--color-foreground)]">
        <header className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold text-sky-700">
            🔬 Ciencias Naturales
          </h1>
          <NavLink
            to="/"
            className="px-3 py-1 rounded-lg border shadow-sm bg-[var(--color-surface)] text-[var(--color-foreground)] border-[var(--color-card-border)]"
          >
            ⬅️ Inicio
          </NavLink>
        </header>

        <AguaDulceSaladaLesson
          onBack={() => setActiveLesson(null)}
          onComplete={(score) => handleComplete("agua", score)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-[var(--color-background)] text-[var(--color-foreground)]">
      <header className="p-4 sm:p-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-sky-700">
          🔬 Ciencias Naturales
        </h1>
        <NavLink
          to="/"
          className="px-3 py-1 rounded-lg border shadow-sm bg-[var(--color-surface)] text-[var(--color-foreground)] border-[var(--color-card-border)]"
        >
          ⬅️ Inicio
        </NavLink>
      </header>

      <section className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-sky-300 via-cyan-300 to-emerald-300 px-4 py-10 text-slate-900">
          <div className="max-w-5xl mx-auto relative">
            <div className="absolute -top-3 right-2 text-6xl opacity-30 select-none">
              🌊
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold drop-shadow-sm">
              ¡Explora la naturaleza! 🌿
            </h2>
            <p className="text-base sm:text-lg font-semibold mt-2 opacity-90">
              Descubre el agua, los seres vivos y el planeta
            </p>
          </div>
        </div>
      </section>

      <div className="px-4 py-8 max-w-2xl mx-auto space-y-3">
        {lessonCards.map((lesson) => {
          const stars = completedStars[lesson.id] || 0;
          const status: LessonStatus =
            stars > 0 ? "completed" : lesson.status;
          const disabled = status === "locked";

          return (
            <button
              key={lesson.id}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && setActiveLesson(lesson.id)}
              className="w-full rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-surface)] px-4 py-4 text-left shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-[var(--color-text-primary)]">
                  {lesson.title}
                </p>
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {status === "completed"
                    ? `⭐`.repeat(stars)
                    : status === "locked"
                    ? "Bloqueado"
                    : "Disponible"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
