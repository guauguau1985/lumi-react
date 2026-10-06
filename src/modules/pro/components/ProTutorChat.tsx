import { useState, type FormEvent } from 'react'
import { IconSend } from '@tabler/icons-react'
import { askTutor, type ProChatMessage } from '@/modules/pro/lib/proTutor'

interface ProTutorChatProps {
  area: string
  lessonTitle: string
  lessonGoal: string
  /** Mensajes iniciales, por ejemplo la revisión de la práctica. */
  initialMessages?: ProChatMessage[]
}

// Conversación con el tutor de Lumi Pro dentro de una lección.
export default function ProTutorChat({
  area,
  lessonTitle,
  lessonGoal,
  initialMessages = [],
}: ProTutorChatProps) {
  const [messages, setMessages] = useState<ProChatMessage[]>(initialMessages)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const send = async (event: FormEvent) => {
    event.preventDefault()
    const message = draft.trim()
    if (!message || busy) return
    const history = messages
    setMessages([...history, { role: 'user', content: message }])
    setDraft('')
    setBusy(true)
    setError('')
    try {
      const reply = await askTutor({ area, lessonTitle, lessonGoal, message, history })
      setMessages((current) => [...current, { role: 'assistant', content: reply }])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'El tutor no respondió.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-2xl border border-pro-border bg-pro-surface">
      <div className="max-h-96 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-pro-muted">
            ¿Tienes una duda sobre esta lección? Pregúntale al tutor. Te va a dar pistas para que
            llegues tú a la respuesta.
          </p>
        )}
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[90%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-6 ${
              message.role === 'user'
                ? 'ml-auto bg-pro-accent text-pro-accent-ink'
                : 'bg-pro-accent-soft text-pro-ink'
            }`}
          >
            {message.content}
          </div>
        ))}
        {busy && <p className="text-sm text-pro-muted">El tutor está escribiendo…</p>}
        {error && <p className="text-sm font-semibold text-pro-bad">{error}</p>}
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-pro-border p-3">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Escribe tu pregunta"
          aria-label="Pregunta para el tutor"
          className="min-w-0 flex-1 rounded-xl border border-pro-border bg-pro-bg px-3 py-2 text-base"
        />
        <button
          type="submit"
          disabled={busy || !draft.trim()}
          aria-label="Enviar"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-pro-accent text-pro-accent-ink hover:bg-pro-accent-hover disabled:opacity-50"
        >
          <IconSend size={18} />
        </button>
      </form>
    </div>
  )
}
