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

  const { feedback, markCorrect, markWrong } = useFeedback(next, 1400);

  function check(ans: number) {
    ans === correctAnswer ? markCorrect() : markWrong();
  }

  // ...
  return (
    <div className="p-6 text-center">
      {/* ... tus botones y layout ... */}
      <Feedback state={feedback} />
    </div>
  );
}
