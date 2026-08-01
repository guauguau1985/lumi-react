/**
 * Configuración de "Lumi habla" (texto → audio con OpenAI).
 *
 * Un solo lugar para la voz por defecto y las opciones disponibles, para no
 * tener que tocar componentes si más adelante cambia la voz elegida. La
 * lista de voces y sus nombres deben coincidir con `ALLOWED_VOICES` en
 * supabase/functions/generate-speech/index.ts.
 */

export type SpeechContext = 'explanation' | 'encouragement' | 'instruction' | 'story'

export interface VoiceOption {
  id: string
  label: string
  description: string
}

/** Voz activa en toda la app. Cambiar aquí basta para afectar a Lumi entera. */
export const DEFAULT_VOICE_ID = 'coral'

/**
 * Voces de OpenAI disponibles para gpt-4o-mini-tts. Usadas por la pantalla
 * de prueba (`VoicePlayground`) para comparar antes de fijar `DEFAULT_VOICE_ID`.
 */
export const VOICE_OPTIONS: VoiceOption[] = [
  { id: 'coral', label: 'Coral', description: 'Cálida y cercana (voz por defecto de Lumi).' },
  { id: 'sage', label: 'Sage', description: 'Suave y serena.' },
  { id: 'nova', label: 'Nova', description: 'Clara y amigable.' },
  { id: 'shimmer', label: 'Shimmer', description: 'Luminosa, algo más joven.' },
  { id: 'alloy', label: 'Alloy', description: 'Neutra y equilibrada.' },
  { id: 'verse', label: 'Verse', description: 'Expresiva, natural para relatos cortos.' },
]

export const SPEED_OPTIONS = {
  normal: 1,
  slow: 0.75,
} as const

export type SpeedOptionId = keyof typeof SPEED_OPTIONS
