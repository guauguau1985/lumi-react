// src/components/Feedback.tsx
import { useEffect } from "react";
import type { FeedbackState } from "@/hooks/useFeedback";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";

// Prefijo para imágenes públicas
const ASSET_BASE = `${import.meta.env.BASE_URL}img/lumi/`;

const LumiFeliz = `${ASSET_BASE}emocionada.png`;
const LumiPensativa = `${ASSET_BASE}pensativa.png`;

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
  if (!state) return null;

  const isOk = state === "correct";

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
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="pointer-events-auto px-5 py-4 text-center"
          style={{}}
        >
          <div
            className={
              "text-lg font-bold " +
              (isOk
                ? "text-[var(--color-success-text)]"
                : "text-[var(--color-error-text)]")
            }
          >
            {isOk ? successText : errorText}
          </div>

          <img
            src={isOk ? LumiFeliz : LumiPensativa}
            alt={isOk ? "Lumi feliz" : "Lumi pensativa"}
            className="w-20 mx-auto mt-2"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}