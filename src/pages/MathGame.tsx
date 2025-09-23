import { useState } from "react";
import Feedback from "../components/Feedback";
import { useFeedback } from "../hooks/useFeedback";

export default function MathGame() {
  const [q, setQ] = useState(() => ({ a: 3, b: 4 }));
  const correctAnswer = q.a * q.b;

  function next() {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setQ({ a, b });
  }

   // ✅ usamos el hook reutilizable; al acertar, avanza solo
  const { feedback, markCorrect, markWrong } = useFeedback(next, 1400);

  function checkAnswer(answer: number) {
    answer === correctAnswer ? markCorrect() : markWrong();
  }

  // cuatro opciones (1 correcta + 3 distractores simples)
  const options = [correctAnswer, correctAnswer + 1, correctAnswer - 1, correctAnswer + 2]
    .sort(() => Math.random() - 0.5);


  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">
        ¿Cuánto es {q.a} × {q.b}?
      </h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {options.map((ans, i) => (
          <button
            key={i}
            onClick={() => checkAnswer(ans)}
            className="bg-blue-500 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-600"
          >
              {ans}
            </button>
          ))}
      </div>

      {/* 🎉 Feedback unificado (Lumi + confeti) */}
      <Feedback state={feedback} successText="¡Muy bien!" errorText="Ups, inténtalo de nuevo" />
    </div>
  );
}

