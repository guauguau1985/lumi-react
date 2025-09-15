import React, { createContext, useContext, useMemo, useCallback, useEffect, useState } from "react";

type OAKey = "OA1" | "OA2" | "OA3" | "OA8" | "OA9" | "OA10" | "OA11";

type ProgressState = {
  best: Partial<Record<OAKey, number>>;          // puntaje máximo por OA
  recordResult: (oa: OAKey, score: number) => void;
  // Desbloqueos (puedes ajustar los umbrales)
  unlocked: {
    OA1: boolean;
    OA2: boolean;   // req OA1 ≥ 60
    OA3: boolean;   // req OA2 ≥ 60
    OA8: boolean;
    OA9: boolean;   // req OA8 ≥ 70
    OA10: boolean;
    OA11: boolean;  // req OA10 ≥ 70
  };
};

const KEY = "lumi.progress.v1";

const ProgressCtx = createContext<ProgressState | null>(null);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [best, setBest] = useState<Partial<Record<OAKey, number>>>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(best));
  }, [best]);

  const recordResult = useCallback((oa: OAKey, score: number) => {
    setBest(prev => {
      const prevBest = prev[oa] ?? 0;
      if (score > prevBest) {
        return { ...prev, [oa]: score };
      }
      return prev;
    });
  }, []);

  const unlocked = useMemo(() => {
    const b = (k: OAKey) => best[k] ?? 0;
    return {
      OA1: true,
      OA2: b("OA1") >= 60,
      OA3: b("OA2") >= 60,
      OA8: true,
      OA9: b("OA8") >= 70,
      OA10: true,
      OA11: b("OA10") >= 70,
    };
  }, [best]);

  return (
    <ProgressCtx.Provider value={{ best, recordResult, unlocked }}>
      {children}
    </ProgressCtx.Provider>
  );
};

export function useProgress() {
  const ctx = useContext(ProgressCtx);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
