import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/shared/lib/supabaseClient'
import { useSpeechSynthesis } from '@/shared/hooks/useSpeechSynthesis'
import { DEFAULT_VOICE_ID, SPEED_OPTIONS, type SpeechContext, type SpeedOptionId } from '@/shared/config/voice'

/**
 * "Lumi habla" con una voz natural: Frontend → Edge Function `generate-speech`
 * → OpenAI Audio (gpt-4o-mini-tts). La API key nunca sale de Supabase.
 *
 * Si el servicio no está configurado, falla, o el dispositivo está sin
 * conexión, cae automáticamente a `useSpeechSynthesis` (voz nativa del
 * navegador) como respaldo — Lumi nunca se queda muda por un error de red.
 *
 * Reutiliza audio ya generado durante la misma sesión de la pestaña (no
 * vuelve a pedir/pagar el mismo texto dos veces) y garantiza que solo haya
 * una lectura activa a la vez en toda la app, sin importar cuántos botones
 * "Escuchar" existan en pantalla (por ejemplo, varios mensajes del chat).
 */

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-speech`

type CachedAudio = { url: string }

// Cache en memoria del proceso (no localStorage, no disco): vive mientras
// dure la pestaña abierta y se pierde al recargar, que es justo lo que
// pide "durante la misma sesión" sin guardar audio permanentemente.
const audioCache = new Map<string, CachedAudio>()

function cacheKey(text: string, voice: string, context?: string) {
  return `${voice}::${context ?? ''}::${text}`
}

type MarkedAudio = HTMLAudioElement & { __lumiStopped?: boolean }

// Solo debe sonar una cosa a la vez en toda la app. Este estado vive fuera
// de React a propósito: cualquier instancia del hook, en cualquier
// componente, debe poder silenciar lo que esté sonando en otro.
let currentAudioEl: MarkedAudio | null = null

function hardStopAudio(audio: MarkedAudio) {
  audio.__lumiStopped = true
  audio.pause()
  audio.currentTime = 0
}

function stopAllPlayback() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
  if (currentAudioEl) {
    hardStopAudio(currentAudioEl)
    currentAudioEl = null
  }
}

async function encodeBase64ToBlobUrl(base64: string, mimeType: string) {
  const byteChars = atob(base64)
  const bytes = new Uint8Array(byteChars.length)
  for (let i = 0; i < byteChars.length; i += 1) bytes[i] = byteChars.charCodeAt(i)
  const blob = new Blob([bytes], { type: mimeType })
  return URL.createObjectURL(blob)
}

export type SpeechEngine = 'openai' | 'native' | null

export interface SpeakOptions {
  context?: SpeechContext
  voice?: string
  onEnd?: () => void
}

export interface UseOpenAiSpeechResult {
  isSpeaking: boolean
  isPaused: boolean
  /** true mientras se genera el audio (llamada a la Edge Function en curso). */
  isLoading: boolean
  error: string | null
  /** Qué motor está sonando ahora mismo, o sonó por última vez. */
  engine: SpeechEngine
  speed: SpeedOptionId
  setSpeed: (speed: SpeedOptionId) => void
  speak: (text: string, options?: SpeakOptions) => void
  pause: () => void
  resume: () => void
  stop: () => void
}

export function useOpenAiSpeech(): UseOpenAiSpeechResult {
  const [audioIsSpeaking, setAudioIsSpeaking] = useState(false)
  const [audioIsPaused, setAudioIsPaused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [engine, setEngine] = useState<SpeechEngine>(null)
  const [speed, setSpeedState] = useState<SpeedOptionId>('normal')

  const speedRef = useRef<SpeedOptionId>('normal')
  const audioRef = useRef<MarkedAudio | null>(null)
  const requestIdRef = useRef(0)
  const native = useSpeechSynthesis()

  useEffect(() => {
    speedRef.current = speed
    if (audioRef.current) audioRef.current.playbackRate = SPEED_OPTIONS[speed]
  }, [speed])

  // Al desmontar (por ejemplo, el mensaje que se estaba leyendo cambió o
  // desapareció), detenemos todo para no dejar audio sonando de fondo.
  useEffect(() => {
    return () => {
      requestIdRef.current += 1
      if (audioRef.current) hardStopAudio(audioRef.current)
    }
  }, [])

  const playUrl = useCallback(
    (url: string, onEnd?: () => void) => {
      const audio: MarkedAudio = new Audio(url)
      audio.playbackRate = SPEED_OPTIONS[speedRef.current]
      audioRef.current = audio
      currentAudioEl = audio

      audio.onplay = () => {
        setEngine('openai')
        setAudioIsSpeaking(true)
        setAudioIsPaused(false)
      }
      audio.onpause = () => {
        if (audio.ended) return
        if (audio.__lumiStopped) {
          setAudioIsSpeaking(false)
          setAudioIsPaused(false)
        } else {
          setAudioIsPaused(true)
        }
      }
      audio.onended = () => {
        setAudioIsSpeaking(false)
        setAudioIsPaused(false)
        if (currentAudioEl === audio) currentAudioEl = null
        onEnd?.()
      }
      audio.onerror = () => {
        setAudioIsSpeaking(false)
        setAudioIsPaused(false)
        if (currentAudioEl === audio) currentAudioEl = null
      }
      audio.play().catch(() => {
        setAudioIsSpeaking(false)
        setAudioIsPaused(false)
      })
    },
    [],
  )

  const speakNative = useCallback(
    (text: string, onEnd?: () => void) => {
      setEngine('native')
      if (!native.isSupported) {
        setError('No pudimos generar la voz y este dispositivo tampoco tiene voz de respaldo.')
        return
      }
      native.speak(text, { onEnd })
    },
    [native],
  )

  const speak = useCallback(
    (text: string, options?: SpeakOptions) => {
      const trimmed = text.trim()
      if (!trimmed) return

      // Nunca dos audios a la vez: primero se acalla cualquier lectura
      // activa en cualquier botón de la app (propia o de otra instancia).
      stopAllPlayback()
      setError(null)
      setEngine(null)

      const requestId = (requestIdRef.current += 1)
      const voice = options?.voice ?? DEFAULT_VOICE_ID
      const key = cacheKey(trimmed, voice, options?.context)
      const cached = audioCache.get(key)

      if (cached) {
        playUrl(cached.url, options?.onEnd)
        return
      }

      setIsLoading(true)
      void (async () => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession()
          if (!session) throw new Error('sin-sesion')

          const response = await fetch(FUNCTION_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ text: trimmed, context: options?.context, voice }),
          })

          // Si mientras esperábamos se pidió leer otra cosa, descartamos
          // esta respuesta: ya no corresponde a lo que se ve en pantalla.
          if (requestId !== requestIdRef.current) return
          if (!response.ok) throw new Error('voice-failed')

          const payload = await response.json()
          const base64 = typeof payload?.audio_base64 === 'string' ? payload.audio_base64 : ''
          if (!base64) throw new Error('voice-empty')

          const url = await encodeBase64ToBlobUrl(base64, payload.mime_type || 'audio/mpeg')
          audioCache.set(key, { url })

          if (requestId !== requestIdRef.current) return
          setIsLoading(false)
          playUrl(url, options?.onEnd)
        } catch {
          if (requestId !== requestIdRef.current) return
          setIsLoading(false)
          speakNative(trimmed, options?.onEnd)
        }
      })()
    },
    [playUrl, speakNative],
  )

  const pause = useCallback(() => {
    if (engine === 'native') {
      native.pause()
    } else if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause()
    }
  }, [engine, native])

  const resume = useCallback(() => {
    if (engine === 'native') {
      native.resume()
    } else if (audioRef.current) {
      void audioRef.current.play()
    }
  }, [engine, native])

  const stop = useCallback(() => {
    stopAllPlayback()
    setAudioIsSpeaking(false)
    setAudioIsPaused(false)
  }, [])

  const setSpeed = useCallback((next: SpeedOptionId) => {
    setSpeedState(next)
  }, [])

  return {
    isSpeaking: engine === 'native' ? native.isSpeaking : audioIsSpeaking,
    isPaused: engine === 'native' ? native.isPaused : audioIsPaused,
    isLoading,
    error: engine === 'native' ? error ?? native.error : error,
    engine,
    speed,
    setSpeed,
    speak,
    pause,
    resume,
    stop,
  }
}
