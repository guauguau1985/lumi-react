import { useEffect } from 'react'
import { IconVolume, IconPlayerStop } from '@tabler/icons-react'
import { useSpeechSynthesis } from '@/shared/hooks/useSpeechSynthesis'

/**
 * Botón "Escuchar" reutilizable: lee `text` en voz alta con `useSpeechSynthesis`
 * y permite detener la lectura. El texto siempre permanece visible en pantalla;
 * este botón solo agrega la lectura en voz alta, nunca reemplaza el texto.
 *
 * No reproduce automáticamente: solo se activa por una acción explícita del niño.
 */
export interface SpeakButtonProps {
  /** Texto visible que Lumi debe leer en voz alta. */
  text: string
  /** Etiqueta cuando no se está reproduciendo. Default: "Escuchar". */
  label?: string
  /** Etiqueta cuando se está reproduciendo. Default: "Detener". */
  stopLabel?: string
  className?: string
}

export function SpeakButton({
  text,
  label = 'Escuchar',
  stopLabel = 'Detener',
  className = '',
}: SpeakButtonProps) {
  const { isSupported, isSpeaking, speak, stop, error } = useSpeechSynthesis()

  // Si el texto a leer cambia (por ejemplo, se pasa a la siguiente pregunta),
  // detenemos cualquier lectura anterior para no leer contenido desactualizado.
  useEffect(() => {
    stop()
    // Solo debe reaccionar a cambios de texto, no a cambios de `stop`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  if (!isSupported) {
    return (
      <p className={`text-xs text-[var(--color-muted-foreground)] ${className}`}>
        🔇 Este dispositivo no puede leer en voz alta.
      </p>
    )
  }

  const handleClick = () => {
    if (isSpeaking) stop()
    else speak(text)
  }

  return (
    <div className={`inline-flex flex-col items-start gap-1 ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={isSpeaking}
        aria-label={isSpeaking ? `${stopLabel} lectura en voz alta` : `${label} en voz alta`}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 ${
          isSpeaking
            ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] animate-pulse'
            : 'border-[var(--color-card-border)] bg-[var(--color-card)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]'
        }`}
      >
        {isSpeaking ? (
          <IconPlayerStop size={18} aria-hidden="true" />
        ) : (
          <IconVolume size={18} aria-hidden="true" />
        )}
        {isSpeaking ? stopLabel : label}
      </button>

      {isSpeaking && (
        <span role="status" className="text-xs font-medium text-[var(--color-primary)]">
          🔊 Lumi está hablando…
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
