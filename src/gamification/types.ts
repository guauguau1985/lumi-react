export type ModuleId =
  | "matematicas"
  | "programacion"
  | "inteligenciaArtificial"
  | "historiasLumi"
  | "educacionAmbiental";

export type GameEventType =
  | "CORRECT_ANSWER"
  | "WRONG_ANSWER"
  | "LEVEL_COMPLETED"
  | "GAME_COMPLETED";

export interface GameEvent {
  module: ModuleId;
  gameId: string;     // ej: "divi-divi-di", "eco-bosque", etc.
  type: GameEventType;
  payload?: Record<string, unknown>;
}

export interface ModuleProgress {
  xp?: number;
  gamesPlayed?: number;
  gamesCompleted?: number;
}

export interface GamificationProfile {
  id: string;
  apodo: string;
  nivel: number;
  xpTotal: number;
  monedas: number;
  rachaDias: number;
  ultimoIngreso: string | null;  // "YYYY-MM-DD"
  insignias: string[];
  modulos: Record<ModuleId, ModuleProgress>;
}
