// Reacciones de Lumi (mood global)_____________________

import React, { createContext, useContext, useState, useCallback } from "react";

type Mood = "feliz" | "confundido" | "pensativa" | "preocupada";

type MoodState = {
  mood: Mood;
  setMood: (m: Mood) => void;
  flashMood: (m: Mood, ms?: number) => void; // cambia por unos segundos y vuelve a "feliz"
};

const MoodCtx = createContext<MoodState | null>(null);

export const MoodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mood, setMoodState] = useState<Mood>("feliz");
  const setMood = useCallback((m: Mood) => setMoodState(m), []);
  const flashMood = useCallback((m: Mood, ms = 1500) => {
    setMoodState(m);
    const id = setTimeout(() => setMoodState("feliz"), ms);
    return () => clearTimeout(id);
  }, []);
  return <MoodCtx.Provider value={{ mood, setMood, flashMood }}>{children}</MoodCtx.Provider>;
};

export function useMood() {
  const ctx = useContext(MoodCtx);
  if (!ctx) throw new Error("useMood must be used within MoodProvider");
  return ctx;
}
