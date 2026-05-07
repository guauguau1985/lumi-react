import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { LumiAvatar } from '@/shared/components/lumi/LumiAvatar'
import { useTutorIA } from '@/shared/hooks/useTutorIA'

interface TutorWidgetProps {
  topic: string
  level?: number
  errorStreak?: number
  attempts?: number
  /** Error streak threshold that auto-opens the tutor. Default: 2 */
  autoTriggerAt?: number
}

export default function TutorWidget({
  topic,
  level,
  errorStreak = 0,
  attempts,
  autoTriggerAt = 2,
}: TutorWidgetProps) {
  const tutor = useTutorIA({ topic, level, mistakes: errorStreak, attempts })
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const prevStreakRef = useRef(errorStreak)
  const autoTriggeredRef = useRef(false)
  const openFromErrorRef = useRef(tutor.openFromError)
  openFromErrorRef.current = tutor.openFromError

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [tutor.messages, tutor.isLoading])

  useEffect(() => {
    if (!tutor.isLoading && tutor.isOpen) {
      inputRef.current?.focus()
    }
  }, [tutor.isLoading, tutor.isOpen])

  // Auto-trigger: fires once each time errorStreak crosses the threshold
  useEffect(() => {
    const prev = prevStreakRef.current
    prevStreakRef.current = errorStreak

    // Reset flag when streak resets (correct answer)
    if (errorStreak === 0) {
      autoTriggeredRef.current = false
      return
    }

    if (errorStreak >= autoTriggerAt && prev < autoTriggerAt && !autoTriggeredRef.current) {
      autoTriggeredRef.current = true
      void openFromErrorRef.current()
    }
  }, [errorStreak, autoTriggerAt])

  const submit = () => {
    if (!input.trim()) return
    void tutor.sendMessage(input)
    setInput('')
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <>
      {/* Floating button — hidden when panel is open */}
      {!tutor.isOpen && (
        <button
          onClick={tutor.openFromButton}
          className="
            fixed bottom-5 right-4 z-40
            flex items-center gap-2
            px-5 py-3 rounded-2xl
            bg-[var(--color-ai-dot)] text-white
            text-base font-bold shadow-xl
            active:scale-95 transition-transform
          "
        >
          💡 ¿Me explicas?
        </button>
      )}

      {/* Panel overlay */}
      {tutor.isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-none">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 pointer-events-auto"
            onClick={tutor.close}
          />

          {/* Panel */}
          <div className="
            relative pointer-events-auto
            flex flex-col
            bg-[var(--color-surface)]
            rounded-t-3xl shadow-2xl
            max-h-[62vh]
            border-t border-[var(--color-ai-border)]
          ">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-card-border)]">
              <LumiAvatar size={38} />
              <div className="flex-1">
                <p className="text-sm font-extrabold text-[var(--color-ai-text)]">💡 Lumi Tutora</p>
                <p className="text-xs text-[var(--color-muted-foreground)] capitalize">{topic}</p>
              </div>
              <button
                onClick={tutor.close}
                aria-label="Cerrar tutor"
                className="text-lg px-2 py-1 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {tutor.messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {msg.role === 'tutor' && (
                    <div className="shrink-0">
                      <LumiAvatar size={28} />
                    </div>
                  )}
                  <div
                    className={`
                      max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm
                      ${msg.role === 'user'
                        ? 'bg-[var(--color-ai-dot)] text-white rounded-br-none'
                        : 'bg-[var(--color-muted)] border border-[var(--color-card-border)] text-[var(--color-foreground)] rounded-bl-none'
                      }
                    `}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {tutor.isLoading && (
                <div className="flex items-end gap-2">
                  <div className="shrink-0">
                    <LumiAvatar size={28} />
                  </div>
                  <div className="bg-[var(--color-muted)] border border-[var(--color-card-border)] px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
                    <div className="flex gap-1.5 items-center">
                      {[0, 150, 300].map(delay => (
                        <span
                          key={delay}
                          className="w-2 h-2 rounded-full bg-[var(--color-ai-dot)] animate-bounce"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-[var(--color-card-border)]">
              {tutor.offline ? (
                <p className="text-center text-sm text-[var(--color-muted-foreground)] py-1">
                  📡 Sin conexión. El tutor estará listo cuando vuelvas a conectarte.
                </p>
              ) : (
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Escribe tu pregunta..."
                    disabled={tutor.isLoading}
                    maxLength={500}
                    className="
                      flex-1 rounded-xl border px-4 py-2 text-sm
                      bg-[var(--color-background)] text-[var(--color-foreground)]
                      border-[var(--color-card-border)]
                      outline-none focus:border-[var(--color-ai-border)]
                      disabled:opacity-50
                      transition-colors
                    "
                  />
                  <button
                    onClick={submit}
                    disabled={!input.trim() || tutor.isLoading}
                    className="
                      px-4 py-2 rounded-xl text-sm font-bold text-white
                      bg-[var(--color-ai-dot)]
                      disabled:opacity-40
                      transition-opacity
                    "
                  >
                    Enviar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
