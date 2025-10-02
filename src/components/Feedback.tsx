// src/components/Feedback.tsx
import { useEffect } from "react";
import type { FeedbackState } from "@/hooks/useFeedback";
import confetti from "canvas-confetti";
import lumiFeliz from "../assets/lumi_feliz.png";
import lumiConfundido from "../assets/lumi_confundido.png";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  state: FeedbackState;
  successText?: string;
  errorText?: string;
};

export default function Feedback({
  state,
  successText = "¡Muy bien!",
  errorText = "Ups, inténtalo de nuevo",
}: Props) {
  // No renderices nada si no hay feedback
  if (!state) return null;

  const isOk = state === "correct";

  // Dispara confetti SOLO al acertar
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
    // Capa fija que no intercepta clics (solo el cuadro)
    <div className="fixed inset-0 z-50 pointer-events-none flex items-start justify-center pt-12">
      <AnimatePresence mode="wait">
        <motion.div
          key={state} // fuerza animación en cada cambio
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="pointer-events-auto rounded-2xl border shadow-lg px-5 py-4 bg-white/90 backdrop-blur text-center"
        >
          <div
            className={
              "text-lg font-bold " + (isOk ? "text-emerald-700" : "text-rose-700")
            }
          >
            {isOk ? successText : errorText}
          </div>

          <img
            src={isOk ? lumiFeliz : lumiConfundido}
            alt={isOk ? "Lumi feliz" : "Lumi confundido"}
            className="w-20 mx-auto mt-2"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
