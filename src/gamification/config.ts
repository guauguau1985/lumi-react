import type { GameEventType, ModuleId } from "./types";

interface GameRule {
  xp: number;
  coins: number;
  badge?: string; // opcional, si este evento da insignia
}

type GameConfig = {
  [key in GameEventType]?: GameRule;
};

type GamificationConfig = {
  [module in ModuleId]?: {
    [gameId: string]: GameConfig;
  };
};

export const gamificationConfig: GamificationConfig = {
  matematicas: {
    "escalera-numerica": {
      CORRECT_ANSWER: { xp: 10, coins: 1 },
      WRONG_ANSWER: { xp: 0, coins: 0 },
      GAME_COMPLETED: { xp: 30, coins: 5, badge: "mat_escalera_fin" },
    },

    "tablas-basicas": {
      CORRECT_ANSWER: { xp: 10, coins: 1 },
      WRONG_ANSWER: { xp: 0, coins: 0 },
      GAME_COMPLETED: { xp: 30, coins: 5, badge: "mat_tablas_fin" },
    },

    "divi-divi-di": {
      CORRECT_ANSWER: { xp: 12, coins: 1 },
      WRONG_ANSWER: { xp: 0, coins: 0 },
      GAME_COMPLETED: { xp: 40, coins: 5, badge: "mat_divi_expert" },
    },

    "pizza-fracciones": {
      CORRECT_ANSWER: { xp: 9, coins: 1 },
      WRONG_ANSWER: { xp: 0, coins: 0 },
      GAME_COMPLETED: { xp: 35, coins: 4, badge: "mat_frac_pizza" },
    },
  },

  educacionAmbiental: {
    "clasificador-del-bosque": {
      CORRECT_ANSWER: { xp: 8, coins: 1 },
      WRONG_ANSWER: { xp: 0, coins: 0 },
      GAME_COMPLETED: { xp: 25, coins: 3, badge: "eco_guardian_bosque" },
    },
  },

  historiasLumi: {
    "historia-conflicto-1": {
      GAME_COMPLETED: { xp: 20, coins: 2, badge: "historia_empatia_1" },
    },
  },
};
