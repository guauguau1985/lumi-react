import { useState } from "react";

export type FeedbackState = null | "correct" | "wrong";

export function useFeedback(
  onCorrect?: () => void,
  delayMs: number = 1200
) {
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
