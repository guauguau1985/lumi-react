import { useEffect } from 'react'
import {
  IconVolume,
  IconPlayerStop,
  IconPlayerPause,
  IconPlayerPlay,
  IconLoader2,
} from '@tabler/icons-react'
import { useOpenAiSpeech } from '@/shared/hooks/useOpenAiSpeech'
import type { SpeechContext } from '@/shared/config/voice'

/**
 * Botón "Escuchar" reutilizable: lee `text` en voz alta con `useOpenAiSpeech`
 * (voz cálida de OpenAI, con respaldo automático a la voz nativa del
 * dispositivo si algo falla) y permite pausar, continuar, detener y elegir
 * velocidad. El texto siempre permanece visible en pantalla; este botón solo
 * agrega la lectura en voz alta, nunca reemplaza el texto.
 *
 * No reproduce automáticamente: solo se activa por una acción explícita del niño.
 */
export interface SpeakButtonProps {
  /** Texto visible que Lumi debe leer en voz alta. */
  text: string
  /** Etiqueta cuando no se está reproduciendo. Default: "Escuchar". */
  label?: string
  /** Etiqueta del botón de detener. Default: "Detener". */
  stopLabel?: string
  className?: string
  /** Tipo de contenido, para afinar el tono de la voz. Ver src/shared/config/voice.ts. */
  context?: SpeechContext
  /** Voz de OpenAI a usar (id de src/shared/config/voice.ts). Default: la voz de Lumi. */
  voice?: string
}

export function SpeakButton({
  text,
  label = 'Escuchar',
  stopLabel = 'Detener',
  className = '',
  context,
  voice,
}: SpeakButtonProps) {
  const { isSpeaking, isPaused, isLoading, error, speed, setSpeed, speak, pause, resume, stop } =
    useOpenAiSpeech()

  // Si el texto a leer cambia (por ejemplo, se pasa a la siguiente pregunta),
  // detenemos cualquier lectura anterior para no leer contenido desactualizado.
  useEffect(() => {
    stop()
    // Solo debe reaccionar a cambios de texto, no a cambios de `stop`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  const handleMainClick = () => {
    if (isLoading) return
    if (isSpeaking && !isPaused) pause()
    else if (isSpeaking && isPaused) resume()
    else speak(text, { context, voice })
  }

  const mainLabel = isLoading
    ? 'Generando voz…'
    : isSpeaking && !isPaused
      ? 'Pausar'
      : isSpeaking && isPaused
        ? 'Continuar'
        : label

  const MainIcon = isLoading
    ? IconLoader2
    : isSpeaking && !isPaused
      ? IconPlayerPause
      : isSpeaking && isPaused
        ? IconPlayerPlay
        : IconVolume

  return (
    <div className={`inline-flex flex-col items-start gap-1.5 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleMainClick}
          disabled={isLoading}
          aria-pressed={isSpeaking && !isPaused}
          aria-label={`${mainLabel} lectura en voz alta`}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 disabled:cursor-wait disabled:opacity-70 ${
            isSpeaking && !isPaused
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] animate-pulse'
              : 'border-[var(--color-card-border)] bg-[var(--color-card)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]'
          }`}
        >
          <MainIcon size={18} aria-hidden="true" className={isLoading ? 'animate-spin' : ''} />
          {mainLabel}
        </button>

        {isSpeaking && (
          <button
            type="button"
            onClick={stop}
            aria-label={`${stopLabel} lectura en voz alta`}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-card-border)] bg-[var(--color-card)] px-3 py-2 text-sm font-semibold text-[var(--color-foreground)] transition hover:bg-[var(--color-muted)] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
          >
            <IconPlayerStop size={16} aria-hidden="true" />
            {stopLabel}
          </button>
        )}

        {(isSpeaking || isLoading) && (
          <div
            role="group"
            aria-label="Velocidad de lectura"
            className="inline-flex overflow-hidden rounded-full border border-[var(--color-card-border)] text-xs font-bold"
          >
            <button
              type="button"
              onClick={() => setSpeed('normal')}
              aria-pressed={speed === 'normal'}
              className={`px-2.5 py-1.5 transition ${
                speed === 'normal'
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                  : 'bg-[var(--color-card)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]'
              }`}
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() => setSpeed('slow')}
              aria-pressed={speed === 'slow'}
              className={`px-2.5 py-1.5 transition ${
                speed === 'slow'
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                  : 'bg-[var(--color-card)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]'
              }`}
            >
              Lenta
            </button>
          </div>
        )}
      </div>

      {isSpeaking && !isPaused && (
        <span role="status" className="text-xs font-medium text-[var(--color-primary)]">
          🔊 Lumi está hablando…
        </span>
      )}
      {isSpeaking && isPaused && (
        <span role="status" className="text-xs font-medium text-[var(--color-muted-foreground)]">
          ⏸️ Lectura en pausa.
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
