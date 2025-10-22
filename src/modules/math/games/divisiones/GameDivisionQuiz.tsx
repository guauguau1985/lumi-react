import { useMemo, useState } from "react";

type Option = {
  label: string;
  value: string;
};

interface Question {
  prompt: string;
  options: Option[];
  answer: string;
  explanation: string;
}

const questions: Question[] = [
  {
    prompt: "¿Cuál es el cociente de 56 ÷ 7?",
    options: [
      { label: "6", value: "6" },
      { label: "7", value: "7" },
      { label: "8", value: "8" },
      { label: "9", value: "9" },
    ],
    answer: "8",
    explanation: "7 × 8 = 56, por lo tanto el cociente es 8.",
  },
  {
    prompt: "En la división 47 ÷ 5, ¿cuál es el resto?",
    options: [
      { label: "1", value: "1" },
      { label: "2", value: "2" },
      { label: "3", value: "3" },
      { label: "4", value: "4" },
    ],
    answer: "2",
    explanation: "5 × 9 = 45 y sobran 2 para llegar a 47, así que el resto es 2.",
  },
  {
    prompt: "¿Qué división tiene resto igual a 0?",
    options: [
      { label: "39 ÷ 5", value: "39" },
      { label: "45 ÷ 9", value: "45" },
      { label: "32 ÷ 6", value: "32" },
      { label: "28 ÷ 5", value: "28" },
    ],
    answer: "45",
    explanation: "45 ÷ 9 = 5 exacto, por lo tanto el resto es 0.",
  },
];

const GameDivisionQuiz = () => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = useMemo(() => questions[questionIndex], [questionIndex]);
  const isLastQuestion = questionIndex === questions.length - 1;

  const handleSubmit = () => {
    if (!selectedValue) {
      return;
    }

    const isCorrect = selectedValue === currentQuestion.answer;
    if (isCorrect) {
      setScore((value) => value + 1);
    }
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (!showExplanation) {
      handleSubmit();
      return;
    }

    if (isLastQuestion) {
      setQuestionIndex(0);
      setScore(0);
    } else {
      setQuestionIndex((index) => index + 1);
    }
    setSelectedValue(null);
    setShowExplanation(false);
  };

  return (
    <div className="space-y-6 text-slate-700">
      <header className="rounded-2xl bg-white p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-amber-700">Desafío final</h2>
            <p className="text-sm text-slate-500">Elige la opción correcta y comprueba tus conocimientos sobre divisiones.</p>
          </div>
          <div className="rounded-full bg-amber-100 px-4 py-1 text-sm font-semibold text-amber-700">
            Puntaje: {score} / {questions.length}
          </div>
        </div>
      </header>

      <section className="space-y-4 rounded-2xl border border-amber-100 bg-amber-50/60 p-6 shadow-sm">
        <div>
          <p className="text-sm uppercase tracking-wide text-amber-600">Pregunta {questionIndex + 1}</p>
          <p className="mt-2 text-lg font-semibold text-amber-800">{currentQuestion.prompt}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedValue === option.value;
            const isCorrect = option.value === currentQuestion.answer;
            const showState = showExplanation && (isSelected || isCorrect);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedValue(option.value)}
                disabled={showExplanation}
                className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-amber-200 ${
                  isSelected && !showExplanation
                    ? "border-amber-500 bg-white shadow"
                    : "border-amber-200 bg-white/80 shadow-sm"
                } ${
                  showState && isCorrect
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : showState
                      ? "border-rose-400 bg-rose-50 text-rose-700"
                      : ""
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <p className="rounded-xl bg-white p-4 text-sm text-amber-800 shadow" role="status">
            {currentQuestion.explanation}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedValue || showExplanation}
            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-amber-300"
          >
            Comprobar respuesta
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="rounded-xl border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
          >
            {showExplanation ? (isLastQuestion ? "Reiniciar" : "Siguiente pregunta") : "Siguiente"}
          </button>
        </div>
      </section>
    </div>
  );
};

export default GameDivisionQuiz;