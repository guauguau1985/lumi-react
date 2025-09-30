import { useEffect } from "react";
import type { FeedbackState } from "@/hooks/useFeedback";
import confetti from "canvas-confetti";
import lumiFeliz from "../assets/lumi_feliz.png";
import lumiConfundido from "../assets/lumi_confundido.png";

export default function Feedback({
  state,
  successText = "¡Muy bien!",
  errorText = "Ups, inténtalo de nuevo",
}: {
  state: FeedbackState;
  successText?: string;
  errorText?: string;
}) {
  if (!state) return null;

  const isOk = state === "correct";

  // dispara confetti SOLO en cliente y SOLO al acertar
  useEffect(() => {
    if (state === "correct") {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.35 },
        scalar: 0.9,
      });
    }
  }, [state]);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-start justify-center pt-12">
      <div
        className={`pointer-events-auto rounded-2xl border shadow-lg px-5 py-4 bg-white/90 backdrop-blur text-center
        ${isOk ? "border-emerald-300" : "border-rose-300"}`}
      >
        <div className={`text-lg font-bold ${isOk ? "text-emerald-700" : "text-rose-700"}`}>
          {isOk ? successText : errorText}
        </div>
        <img
          src={isOk ? lumiFeliz : lumiConfundido}
          alt={isOk ? "Lumi feliz" : "Lumi confundido"}
          className="w-20 mx-auto mt-2"
        />
      </div>
    </div>
  );
}
