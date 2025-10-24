import { useEffect, useRef, useState } from "react";

export type FeedbackState = "correct" | "wrong" | null;

export function useFeedback(
  opts: { onCorrect?: () => void; delayMs?: number } = {}
) {
  const { onCorrect, delayMs = 1600 } = opts;
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function clear() {
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setFeedback(null);
  }

  function markCorrect() {
    // limpiar timeout previo
    if (timeoutRef.current != null) window.clearTimeout(timeoutRef.current);
    setFeedback("correct");
    timeoutRef.current = window.setTimeout(() => {
      setFeedback(null);
      timeoutRef.current = null;
      onCorrect?.();
    }, delayMs) as unknown as number;
  }

  function markWrong() {
    if (timeoutRef.current != null) window.clearTimeout(timeoutRef.current);
    setFeedback("wrong");
    timeoutRef.current = window.setTimeout(() => {
      setFeedback(null);
      timeoutRef.current = null;
    }, delayMs) as unknown as number;
  }

  return { feedback, markCorrect, markWrong, clear } as const;
}
