import { useGamification } from "./GamificationContext";
import type { ModuleId, GameEventType } from "./types";

export function useGameRewards(module: ModuleId, gameId: string) {
  const { dispatchEvent, profile } = useGamification();

  const sendEvent = (type: GameEventType, payload?: Record<string, unknown>) => {
    dispatchEvent({ module, gameId, type, payload });
  };

  return {
    profile,                     // por si quieres mostrar nivel, monedas, etc.
    onCorrect: (payload?: Record<string, unknown>) => sendEvent("CORRECT_ANSWER", payload),
    onWrong: (payload?: Record<string, unknown>) => sendEvent("WRONG_ANSWER", payload),
    onLevelCompleted: (payload?: Record<string, unknown>) =>
      sendEvent("LEVEL_COMPLETED", payload),
    onGameCompleted: (payload?: Record<string, unknown>) =>
      sendEvent("GAME_COMPLETED", payload),
  };
}
