import { useState } from "react";
import Confetti from "react-confetti";
import lumiFeliz from "../assets/lumi_feliz.png";
import lumiConfundida from "../assets/lumi_confundida.png";

export default function MathGame() {
  const [question, setQuestion] = useState({ a: 3, b: 4 });
  const [feedback, setFeedback] = useState<null | "correct" | "wrong">(null);

  const correctAnswer = question.a * question.b;

  function generateNewQuestion() {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setQuestion({ a, b });
  }

  function checkAnswer(answer: number) {
    if (answer === correctAnswer) {
      setFeedback("correct");
      setTimeout(() => {
        setFeedback(null);
        generateNewQuestion();
      }, 1500);
    } else {
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 1500);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">
        ¿Cuánto es {question.a} × {question.b}?
      </h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {[correctAnswer, correctAnswer + 1, correctAnswer - 1, correctAnswer + 2]
          .sort(() => Math.random() - 0.5)
          .map((ans, i) => (
            <button
              key={i}
              onClick={() => checkAnswer(ans)}
              className="bg-blue-500 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-600"
            >
              {ans}
            </button>
          ))}
      </div>

      {/* Feedback visual */}
      {feedback === "correct" && (
        <>
          <p className="text-green-600 font-bold text-xl mb-2">
            ¡Muy bien! 🎉
          </p>
          <img src={lumiFeliz} alt="Lumi feliz" className="w-32" />
          <Confetti recycle={false} numberOfPieces={200} />
        </>
      )}
      {feedback === "wrong" && (
        <>
          <p className="text-red-600 font-bold text-xl mb-2">
            Ups, inténtalo de nuevo ❌
          </p>
          <img src={lumiConfundida} alt="Lumi confundida" className="w-32" />
        </>
      )}
    </div>
  );
}