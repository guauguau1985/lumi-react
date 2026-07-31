import { useEffect, useRef } from 'react'
import { IconMicrophone, IconPlayerStop } from '@tabler/icons-react'
import { useSpeechRecognition } from '@/shared/hooks/useSpeechRecognition'

/**
 * Botón "Responder hablando" reutilizable: convierte voz a texto con
 * `useSpeechRecognition` y entrega el resultado final a través de `onResult`.
 *
 * No decide qué hacer con la respuesta: el componente que lo usa es quien
 * coloca el texto reconocido en su propio campo editable (por eso `onResult`
 * recibe el texto en vez de que este componente posea el campo). Así el niño
 * siempre ve y puede corregir la transcripción antes de enviarla, usando el
 * mismo flujo de respuesta que ya existe en cada juego.
 */
export interface VoiceInputButtonProps {
  /** Texto final reconocido, listo para colocarse en un campo de respuesta editable. */
  onResult: (text: string) => void
  /** Opcional: texto parcial mientras el niño sigue hablando (para mostrar en vivo). */
  onInterimResult?: (text: string) => void
  label?: string
  listeningLabel?: string
  cancelLabel?: string
  className?: string
}

export function VoiceInputButton({
  onResult,
  onInterimResult,
  label = 'Responder hablando',
  listeningLabel = 'Escuchando…',
  cancelLabel = 'Cancelar',
  className = '',
}: VoiceInputButtonProps) {
  const { isSupported, isListening, transcript, interimTranscript, error, start, cancel, reset } =
    useSpeechRecognition()

  const wasListeningRef = useRef(false)

  // Cuando termina una sesión de escucha con resultado, se entrega al
  // consumidor (que lo coloca en su campo de texto editable existente) y se
  // limpia el hook para la próxima vez. Si el niño canceló, el transcript ya
  // fue vaciado por `handleMicClick` y no se llama a `onResult`.
  useEffect(() => {
    if (wasListeningRef.current && !isListening && transcript.trim()) {
      onResult(transcript.trim())
      reset()
    }
    wasListeningRef.current = isListening
  }, [isListening, transcript, onResult, reset])

  useEffect(() => {
    if (isListening) onInterimResult?.(interimTranscript)
  }, [interimTranscript, isListening, onInterimResult])

  if (!isSupported) {
    return (
      <p className={`text-xs text-[var(--color-muted-foreground)] ${className}`}>
        🔇 Tu navegador no permite responder hablando aquí. Escribe tu respuesta.
      </p>
    )
  }

  const handleMicClick = () => {
    if (isListening) {
      cancel()
      reset()
    } else {
      start()
    }
  }

  return (
    <div className={`inline-flex flex-col items-start gap-1 ${className}`}>
      <button
        type="button"
        onClick={handleMicClick}
        aria-pressed={isListening}
        aria-label={isListening ? `${cancelLabel} micrófono` : label}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--color-error-text)]/30 ${
          isListening
            ? 'border-[var(--color-error-text)] bg-[var(--color-error-text)] text-white animate-pulse'
            : 'border-[var(--color-card-border)] bg-[var(--color-card)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]'
        }`}
      >
        {isListening ? (
          <IconPlayerStop size={18} aria-hidden="true" />
        ) : (
          <IconMicrophone size={18} aria-hidden="true" />
        )}
        {isListening ? cancelLabel : label}
      </button>

      {isListening && (
        <span role="status" className="text-xs font-medium text-[var(--color-error-text)]">
          🎙️ {listeningLabel} {interimTranscript && `"${interimTranscript}"`}
        </span>
      )}

      {error && (
        <span role="alert" className="text-xs text-[var(--color-error-text)]">
          {error}
        </span>
      )}
    </div>
  )
}
