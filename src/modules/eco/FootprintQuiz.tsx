import { useState } from "react";
import { FOOTPRINT_QUIZ } from "@/data/ecoData";
import Feedback from "@/components/Feedback";
import { useFeedback } from "@/hooks/useFeedback";

export default function FootprintQuiz() {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const { feedback, markCorrect, markWrong } = useFeedback();

  const q = FOOTPRINT_QUIZ[idx];

  function pick(optId: string) {
    const opt = q.options.find((o) => o.id === optId)!;
    if (opt.correct) {
      setScore((s) => s + 1);
      markCorrect();
    } else {
      markWrong();
    }
    const next = idx + 1;
    window.setTimeout(() => {
      if (next < FOOTPRINT_QUIZ.length) setIdx(next);
      else setDone(true);
    }, 700);
  }

  return (
    <main className="min-h-svh p-4 sm:p-6 bg-gradient-to-br from-emerald-50 to-sky-50">
      <h1 className="text-xl sm:text-2xl font-extrabold text-emerald-700">Quiz Huella Verde</h1>

      {!done ? (
        <section className="mt-4 bg-white rounded-2xl shadow p-5">
          <p className="text-gray-800 font-semibold">{q.text}</p>
          <div className="mt-3 grid gap-2">
            {q.options.map((o) => (
              <button
                key={o.id}
                onClick={() => pick(o.id)}
                className="text-left px-4 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100"
              >
                {o.text}
              </button>
            ))}
          </div>
          {q.tip && <p className="mt-3 text-sm text-gray-600">💡 {q.tip}</p>}
          <p className="mt-4 text-sm text-gray-500">Pregunta {idx + 1} de {FOOTPRINT_QUIZ.length}</p>
        </section>
      ) : (
        <section className="mt-4 bg-white rounded-2xl shadow p-5 text-center">
          <p className="text-gray-800 font-semibold">Puntaje: {score} / {FOOTPRINT_QUIZ.length}</p>
          <img src="/src/assets/eco/badge_huella.svg" alt="Badge Huella Verde" className="w-24 mx-auto mt-3" />
          <p className="text-emerald-700 font-bold mt-2">¡Insignia Huella Verde!</p>
        </section>
      )}

      <Feedback state={feedback} />
    </main>
  );
}
