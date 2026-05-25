// src/shared/components/ui/ConsentModal.tsx
import { setProfileEnabled } from '@/shared/lib/deviceId'

interface ConsentModalProps {
  onClose: () => void
}

export function ConsentModal({ onClose }: ConsentModalProps) {
  function handleAccept() {
    setProfileEnabled(true)
    onClose()
  }

  function handleDecline() {
    setProfileEnabled(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        className="w-full max-w-md rounded-2xl bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)] sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-title"
      >
        {/* Ícono */}
        <div className="mb-4 flex justify-center text-5xl">🧠</div>

        {/* Título */}
        <h2
          id="consent-title"
          className="mb-3 text-center text-xl font-extrabold text-[var(--color-text-primary)] sm:text-2xl"
        >
          ¿Activamos tu perfil de aprendizaje?
        </h2>

        {/* Descripción */}
        <p className="mb-2 text-center text-sm text-[var(--color-text-secondary)] sm:text-base">
          Lumi puede recordar cómo aprendes para mostrarte ejercicios adecuados
          a tu nivel y ritmo.
        </p>
        <p className="mb-6 text-center text-sm text-[var(--color-text-secondary)] sm:text-base">
          Solo guardamos tu progreso en los juegos. <strong>No guardamos tu nombre</strong>{' '}
          ni ningún dato personal.
        </p>

        {/* Detalle de datos */}
        <ul className="mb-6 space-y-1 rounded-xl bg-[var(--color-muted)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
          <li>✅ Respuestas correctas e incorrectas por juego</li>
          <li>✅ Velocidad aproximada de respuesta</li>
          <li>✅ Módulos que más practicas</li>
          <li>❌ Sin nombre, sin correo, sin ubicación</li>
        </ul>

        {/* Botones */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={handleAccept}
            className="w-full rounded-2xl bg-[var(--color-primary)] px-6 py-3 text-base font-bold text-[var(--color-primary-foreground)] transition-opacity hover:opacity-90 active:scale-95 sm:w-auto"
          >
            Sí, activar perfil
          </button>
          <button
            onClick={handleDecline}
            className="w-full rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] px-6 py-3 text-base font-semibold text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-muted)] active:scale-95 sm:w-auto"
          >
            No por ahora
          </button>
        </div>

        {/* Nota legal */}
        <p className="mt-4 text-center text-xs text-[var(--color-text-secondary)]">
          Puedes cambiar esto más adelante en tu perfil.
        </p>
      </div>
    </div>
  )
}
