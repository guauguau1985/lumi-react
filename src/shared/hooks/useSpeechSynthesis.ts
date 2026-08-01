import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Hook de síntesis de voz (texto → audio) sobre la Web Speech API nativa del
 * navegador (`window.speechSynthesis` / `SpeechSynthesisUtterance`). Sin costo,
 * sin servicios externos.
 *
 * Agnóstico de dominio: no sabe nada de juegos, gamificación ni tracking. Solo
 * sabe leer un texto en voz alta en español, con una voz razonable para es-CL.
 *
 * Pensado para ser la base de "Lumi habla" en cualquier pantalla, y reutilizable
 * más adelante en el modo manos libres.
 */

export type SpeechSynthesisErrorKind =
  | 'unsupported'
  | 'synthesis-failed'
  | 'unknown'

export interface UseSpeechSynthesisResult {
  /** true si el navegador soporta síntesis de voz (detectado en runtime). */
  isSupported: boolean
  /** true mientras Lumi está reproduciendo audio (no pausado). */
  isSpeaking: boolean
  /** true si la reproducción está pausada. */
  isPaused: boolean
  /** Mensaje de error legible, o null si no hay error. */
  error: string | null
  /** Lee `text` en voz alta. Cancela cualquier lectura previa antes de empezar. */
  speak: (text: string, options?: { onEnd?: () => void }) => void
  /** Pausa la lectura en curso (si el navegador lo soporta). */
  pause: () => void
  /** Reanuda una lectura pausada. */
  resume: () => void
  /** Detiene la lectura por completo. */
  stop: () => void
}

const PREFERRED_LANG = 'es-CL'

// Puntaje por variante de español cuando no hay una voz es-CL instalada.
// El español de España queda deliberadamente al final: para oídos chilenos
// suena más lejano que cualquier variante latinoamericana disponible.
const LANG_SCORE: Record<string, number> = {
  'es-cl': 100,
  'es-419': 95,
  'es-mx': 90,
  'es-us': 88,
  'es-ar': 85,
  'es-co': 85,
  'es-pe': 85,
  'es-ve': 85,
  'es-ec': 85,
  'es-uy': 85,
  'es-py': 85,
  'es-bo': 85,
  'es-do': 85,
  'es-gt': 85,
  'es-cr': 85,
  'es-pa': 85,
  'es-hn': 85,
  'es-ni': 85,
  'es-sv': 85,
  'es-pr': 85,
  'es-es': 10,
}

// Pistas en el *nombre* de la voz (no solo el código de idioma) que ayudan a
// elegir una voz más cálida/natural y a evitar acento español de España.
// Algunos navegadores (sobre todo Windows/Edge) reportan "es-ES" para varias
// voces aunque el nombre indique otro país, así que el nombre es una señal
// adicional, nunca la única fuente de verdad.
const QUALITY_NAME_HINTS = ['natural', 'online', 'neural', 'plus']
const LATIN_NAME_HINTS = [
  'méxico', 'mexico', 'latin', 'estados unidos', 'united states', 'sabina', 'paulina', 'dalia', 'larissa',
]
const SPAIN_NAME_HINTS = ['españa', 'spain', 'castellano']

function isSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
}

function scoreVoice(voice: SpeechSynthesisVoice): number {
  const lang = voice.lang.toLowerCase()
  const name = voice.name.toLowerCase()
  const baseScore = LANG_SCORE[lang] ?? (lang.startsWith('es') ? 40 : -1)
  if (baseScore < 0) return baseScore

  let score = baseScore
  if (QUALITY_NAME_HINTS.some(hint => name.includes(hint))) score += 15
  if (LATIN_NAME_HINTS.some(hint => name.includes(hint))) score += 10
  if (SPAIN_NAME_HINTS.some(hint => name.includes(hint))) score -= 20
  return score
}

/** Elige la mejor voz en español disponible en este dispositivo, priorizando
 * variantes latinoamericanas (idealmente es-CL) sobre español de España. */
function pickSpanishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const best = voices
    .map(voice => ({ voice, score: scoreVoice(voice) }))
    .filter(entry => entry.score >= 0)
    .sort((a, b) => b.score - a.score)[0]

  return best?.voice
}

export function useSpeechSynthesis(): UseSpeechSynthesisResult {
  const supported = isSynthesisSupported()
  const [isSupported] = useState(supported)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const voicesRef = useRef<SpeechSynthesisVoice[]>([])
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Carga la lista de voces disponibles (puede llegar async en Chrome/Android).
  useEffect(() => {
    if (!supported) return

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices()
    }

    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
    }
  }, [supported])

  // Detiene cualquier lectura activa al desmontar el componente que usa el hook.
  useEffect(() => {
    return () => {
      if (supported) {
        window.speechSynthesis.cancel()
      }
    }
  }, [supported])

  const stop = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setIsPaused(false)
  }, [supported])

  const speak = useCallback(
    (text: string, options?: { onEnd?: () => void }) => {
      if (!supported) {
        setError('Este dispositivo no puede leer en voz alta.')
        return
      }
      const trimmed = text.trim()
      if (!trimmed) return

      setError(null)
      // Nunca dos lecturas superpuestas: se cancela la anterior antes de empezar.
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(trimmed)
      const voice = pickSpanishVoice(voicesRef.current)
      utterance.lang = voice?.lang ?? PREFERRED_LANG
      if (voice) utterance.voice = voice
      utterance.rate = 0.95
      // Un poco más agudo que el default: se percibe como un tono más cálido
      // y amigable para una tutora infantil, sin sonar forzado.
      utterance.pitch = 1.05

      utterance.onstart = () => {
        setIsSpeaking(true)
        setIsPaused(false)
      }
      utterance.onend = () => {
        setIsSpeaking(false)
        setIsPaused(false)
        options?.onEnd?.()
      }
      utterance.onerror = () => {
        setIsSpeaking(false)
        setIsPaused(false)
        setError('No se pudo leer el texto en voz alta.')
      }
      utterance.onpause = () => setIsPaused(true)
      utterance.onresume = () => setIsPaused(false)

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    },
    [supported],
  )

  const pause = useCallback(() => {
    if (!supported || !isSpeaking) return
    window.speechSynthesis.pause()
  }, [supported, isSpeaking])

  const resume = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.resume()
  }, [supported])

  return { isSupported, isSpeaking, isPaused, error, speak, pause, resume, stop }
}
