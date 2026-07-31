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
// Orden de preferencia para elegir voz cuando no hay una es-CL instalada.
const FALLBACK_LANG_PREFIXES = ['es-cl', 'es-419', 'es-mx', 'es-es', 'es-us', 'es']

function isSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
}

function pickSpanishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  if (voices.length === 0) return undefined

  for (const prefix of FALLBACK_LANG_PREFIXES) {
    const match = voices.find(v => v.lang.toLowerCase() === prefix)
    if (match) return match
  }
  // Cualquier voz cuyo idioma empiece con "es" (por ejemplo es-AR, es-CO, etc.)
  const anySpanish = voices.find(v => v.lang.toLowerCase().startsWith('es'))
  if (anySpanish) return anySpanish

  return undefined
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
      utterance.pitch = 1

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
