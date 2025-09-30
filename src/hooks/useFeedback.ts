import { useState } from "react";

export type FeedbackState = "correct" | "wrong" | null;

export function useFeedback(
  opts: { onCorrect?: () => void; delayMs?: number } = {}
) {
  const { onCorrect, delayMs = 1200 } = opts;
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  function markCorrect() {
    setFeedback("correct");
    window.setTimeout(() => {
      setFeedback(null);
      onCorrect?.();
    }, delayMs);
  }

  function markWrong() {
    setFeedback("wrong");
    window.setTimeout(() => setFeedback(null), delayMs);
  }

  return { feedback, markCorrect, markWrong };
}
