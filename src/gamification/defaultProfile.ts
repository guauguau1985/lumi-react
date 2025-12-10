import type { GamificationProfile } from "./types";

export const defaultProfile: GamificationProfile = {
  id: "jugador-unico",
  apodo: "Jugador",
  nivel: 1,
  xpTotal: 0,
  monedas: 0,
  rachaDias: 0,
  ultimoIngreso: null,
  insignias: [],
  modulos: {
    matematicas: {},
    programacion: {},
    inteligenciaArtificial: {},
    historiasLumi: {},
    educacionAmbiental: {},
  },
};
