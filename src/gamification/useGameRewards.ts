import { useGamification } from "./GamificationContext";
import type { ModuleId, GameEventType } from "./types";

export function useGameRewards(module: ModuleId, gameId: string) {
  const { dispatchEvent, profile } = useGamification();

  const sendEvent = (type: GameEventType, payload?: Record<string, unknown>) => {
    dispatchEvent({ module, gameId, type, payload });
  };

  return {
    profile,                     // por si quieres mostrar nivel, monedas, etc.
    onCorrect: () => sendEvent("CORRECT_ANSWER"),
    onWrong: () => sendEvent("WRONG_ANSWER"),
    onLevelCompleted: () => sendEvent("LEVEL_COMPLETED"),
    onGameCompleted: () => sendEvent("GAME_COMPLETED"),
  };
}
