import { useCallback, useEffect, useRef, useState } from 'react'

// Los tipos globales de SpeechRecognition (no incluidos en lib.dom de TS) se
// declaran en `src/shared/types/webSpeechRecognition.d.ts` y se aplican
// automáticamente a todo el proyecto porque tsconfig incluye `src` completo.

/**
 * Hook de reconocimiento de voz (audio → texto) sobre la Web Speech API nativa
 * del navegador (`SpeechRecognition` / `webkitSpeechRecognition`). Sin costo,
 * sin servicios externos, sin envío ni almacenamiento de audio: solo se guarda
 * el texto transcrito en memoria de React.
 *
 * Agnóstico de dominio: no valida respuestas ni conoce el ejercicio en curso.
 * El componente que use este hook decide qué hacer con el texto reconocido
 * (por ejemplo, colocarlo en un campo de respuesta editable).
 *
 * Pensado como base reutilizable para "El niño habla" y, más adelante, para el
 * modo manos libres.
 */

export interface UseSpeechRecognitionResult {
  /** true si el navegador soporta reconocimiento de voz (detectado en runtime). */
  isSupported: boolean
  /** true mientras el micrófono está activo escuchando. */
  isListening: boolean
  /** Último resultado final reconocido. */
  transcript: string
  /** Resultado parcial mientras el niño sigue hablando (aún no confirmado). */
  interimTranscript: string
  /** Mensaje de error legible en español, o null si no hay error. */
  error: string | null
  /** Inicia una sesión de escucha. No hace nada si ya hay una sesión activa. */
  start: () => void
  /** Detiene la escucha y conserva el resultado reconocido hasta el momento. */
  stop: () => void
  /** Cancela la escucha descartando el resultado en curso. */
  cancel: () => void
  /** Limpia el transcript y cualquier error, sin afectar una sesión activa. */
  reset: () => void
}

const RECOGNITION_LANG = 'es-CL'

function getRecognitionConstructor(): (new () => SpeechRecognition) | null {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
}

function describeError(code: SpeechRecognitionErrorEvent['error']): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'No pudimos usar el micrófono. Revisa los permisos en tu navegador.'
    case 'audio-capture':
      return 'No encontramos un micrófono en este dispositivo.'
    case 'no-speech':
      return 'No escuchamos nada. Inténtalo de nuevo hablando cerca del micrófono.'
    case 'network':
      return 'Hubo un problema de conexión al reconocer tu voz.'
    default:
      return 'Ocurrió un problema al reconocer tu voz. Inténtalo de nuevo.'
  }
}

export function useSpeechRecognition(): UseSpeechRecognitionResult {
  const RecognitionCtor = getRecognitionConstructor()
  const [isSupported] = useState(RecognitionCtor !== null)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  // Distingue una cancelación deliberada de un error real, para no mostrar
  // mensaje de error cuando el propio niño canceló.
  const cancelledRef = useRef(false)

  const teardown = useCallback(() => {
    const recognition = recognitionRef.current
    if (!recognition) return
    recognition.onstart = null
    recognition.onresult = null
    recognition.onerror = null
    recognition.onend = null
    recognitionRef.current = null
  }, [])

  // Detiene el reconocimiento activo si el componente se desmonta.
  useEffect(() => {
    return () => {
      cancelledRef.current = true
      recognitionRef.current?.abort()
      teardown()
    }
  }, [teardown])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const cancel = useCallback(() => {
    if (!recognitionRef.current) return
    cancelledRef.current = true
    recognitionRef.current.abort()
  }, [])

  const reset = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
    setError(null)
  }, [])

  const start = useCallback(() => {
    if (!RecognitionCtor) {
      setError('Este dispositivo no permite responder hablando aquí.')
      return
    }
    // Nunca dos sesiones de escucha simultáneas.
    if (isListening || recognitionRef.current) return

    setError(null)
    setTranscript('')
    setInterimTranscript('')
    cancelledRef.current = false

    const recognition = new RecognitionCtor()
    recognition.lang = RECOGNITION_LANG
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)

    recognition.onresult = event => {
      let finalText = ''
      let interimText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0]?.transcript ?? ''
        if (result.isFinal) finalText += text
        else interimText += text
      }
      if (finalText) setTranscript(prev => `${prev}${prev ? ' ' : ''}${finalText}`.trim())
      setInterimTranscript(interimText)
    }

    recognition.onerror = event => {
      if (!cancelledRef.current && event.error !== 'aborted') {
        setError(describeError(event.error))
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimTranscript('')
      teardown()
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
    } catch {
      // Ya había una sesión en curso a nivel de navegador; se ignora, el estado
      // se resincroniza en el próximo onend/onerror.
      setIsListening(false)
      recognitionRef.current = null
    }
  }, [RecognitionCtor, isListening, teardown])

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
    cancel,
    reset,
  }
}
