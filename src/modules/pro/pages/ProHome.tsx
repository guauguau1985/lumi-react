import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  IconCheck,
  IconChevronRight,
  IconClock,
  IconFlame,
  IconLock,
  IconRepeat,
} from '@tabler/icons-react'
import { PRO_LESSONS, PRO_WEEKS, getLesson } from '@/modules/pro/data/rutaRapida'
import { localDate, reportMiniTask } from '@/modules/pro/lib/proStore'
import { usePro } from '@/modules/pro/lib/ProContext'

export default function ProHome() {
  const { settings, progress, due, streak, minutesSaved } = usePro()
  const completedIds = new Set(progress.map((row) => row.lesson_id))
  const nextLesson = PRO_LESSONS.find((lesson) => !completedIds.has(lesson.id))

  // Mini tarea pendiente de reportar: una lección terminada antes de hoy
  // sin minutos ahorrados registrados.
  const today = localDate()
  const pendingReport = [...progress]
    .filter((row) => row.minutes_saved === null && row.completed_at.slice(0, 10) < today)
    .sort((a, b) => b.completed_at.localeCompare(a.completed_at))
    .at(0)

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          {nextLesson ? 'Tu lección de hoy' : 'Terminaste la semana 1'}
        </h1>
        {settings?.plan_cuando && (
          <p className="mt-2 text-sm text-pro-muted">Tu plan: {settings.plan_cuando}</p>
        )}
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat
          icon={<IconFlame size={20} />}
          value={`${streak} ${streak === 1 ? 'día' : 'días'}`}
          label="Racha (un día perdido no la corta)"
        />
        <Stat
          icon={<IconRepeat size={20} />}
          value={`${due.length}`}
          label={due.length === 1 ? 'Pregunta para repasar hoy' : 'Preguntas para repasar hoy'}
        />
        <Stat
          icon={<IconClock size={20} />}
          value={`${minutesSaved} min`}
          label="Ahorrados en tu trabajo"
        />
      </section>

      {pendingReport && <MiniTaskReport lessonId={pendingReport.lesson_id} />}

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {due.length > 0 && (
          <ActionCard
            to="/pro/repaso"
            eyebrow="Primero, 2 minutos"
            title={`Repasa ${due.length} ${due.length === 1 ? 'pregunta' : 'preguntas'}`}
            text="Recordar lo de días anteriores es lo que hace que no se olvide."
          />
        )}
        {nextLesson && (
          <ActionCard
            to={`/pro/leccion/${nextLesson.id}`}
            eyebrow={`Semana ${nextLesson.week} · Lección ${nextLesson.order} · ${nextLesson.minutes} min`}
            title={nextLesson.title}
            text={nextLesson.goal}
            primary
          />
        )}
      </section>

      <section>
        <h2 className="text-lg font-extrabold">Ruta rápida: IA en tu trabajo</h2>
        <p className="mt-1 text-sm text-pro-muted">
          4 semanas, 20 lecciones de 15 minutos. Puedes hacerlas en el orden que quieras.
        </p>
        <div className="mt-4 space-y-4">
          {PRO_WEEKS.map((week) => (
            <div
              key={week.number}
              className="rounded-2xl border border-pro-border bg-pro-surface p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-extrabold">
                  Semana {week.number} · {week.title}
                </h3>
                {!week.available && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-pro-muted">
                    <IconLock size={14} /> En preparación
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-pro-muted">Al terminar: {week.outcome}</p>
              <ul className="mt-3 divide-y divide-pro-border">
                {week.lessonTitles.map((title, index) => {
                  const lesson = week.available
                    ? PRO_LESSONS.find((item) => item.week === week.number && item.order === index + 1)
                    : undefined
                  const done = lesson ? completedIds.has(lesson.id) : false
                  const content = (
                    <>
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                          done
                            ? 'bg-pro-good-soft text-pro-good'
                            : 'border border-pro-border text-pro-muted'
                        }`}
                      >
                        {done ? <IconCheck size={15} /> : index + 1}
                      </span>
                      <span className={`flex-1 text-sm sm:text-base ${lesson ? '' : 'text-pro-muted'}`}>
                        {title}
                      </span>
                      {lesson && <IconChevronRight size={18} className="text-pro-muted" />}
                    </>
                  )
                  return (
                    <li key={title}>
                      {lesson ? (
                        <Link
                          to={`/pro/leccion/${lesson.id}`}
                          className="flex items-center gap-3 rounded-lg py-2.5 hover:bg-pro-accent-soft"
                        >
                          {content}
                        </Link>
                      ) : (
                        <div className="flex items-center gap-3 py-2.5">{content}</div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function Stat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-pro-border bg-pro-surface p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-pro-accent-soft text-pro-accent">
        {icon}
      </span>
      <div>
        <p className="text-xl font-extrabold leading-tight">{value}</p>
        <p className="text-xs text-pro-muted">{label}</p>
      </div>
    </div>
  )
}

function ActionCard({
  to,
  eyebrow,
  title,
  text,
  primary = false,
}: {
  to: string
  eyebrow: string
  title: string
  text: string
  primary?: boolean
}) {
  return (
    <Link
      to={to}
      className={`group block rounded-2xl border p-5 transition-colors ${
        primary
          ? 'border-pro-accent bg-pro-accent text-pro-accent-ink hover:bg-pro-accent-hover'
          : 'border-pro-border bg-pro-surface hover:border-pro-accent'
      }`}
    >
      <p className={`text-xs font-bold uppercase tracking-wide ${primary ? 'opacity-80' : 'text-pro-muted'}`}>
        {eyebrow}
      </p>
      <p className="mt-1 text-lg font-extrabold leading-snug">{title}</p>
      <p className={`mt-1 text-sm leading-6 ${primary ? 'opacity-90' : 'text-pro-muted'}`}>{text}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold">
        {primary ? 'Empezar' : 'Repasar'} <IconChevronRight size={16} />
      </span>
    </Link>
  )
}

// Pregunta por la mini tarea de la lección anterior y registra los minutos
// ahorrados: lo que motiva a un adulto es ver el beneficio en su trabajo.
function MiniTaskReport({ lessonId }: { lessonId: string }) {
  const { userId, refresh } = usePro()
  const lesson = getLesson(lessonId)
  const [minutes, setMinutes] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!lesson) return null

  const save = async (minutesSaved: number, text: string) => {
    setBusy(true)
    setError('')
    try {
      await reportMiniTask({ userId, lessonId, minutesSaved, note: text })
      await refresh()
    } catch (cause) {
      console.error('[Lumi Pro] No se pudo guardar la mini tarea:', cause)
      setError('No pudimos guardar. Intenta de nuevo.')
      setBusy(false)
    }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const value = Number(minutes)
    if (!Number.isFinite(value) || value < 0) {
      setError('Escribe los minutos como número.')
      return
    }
    void save(value, note.trim())
  }

  return (
    <section className="rounded-2xl border border-pro-accent bg-pro-accent-soft p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-pro-accent">
        Tu mini tarea de «{lesson.title}»
      </p>
      <p className="mt-1 text-base font-bold leading-7">{lesson.miniTask}</p>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Minutos ahorrados
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={600}
            value={minutes}
            onChange={(event) => setMinutes(event.target.value)}
            className="w-full rounded-xl border border-pro-border bg-pro-surface px-3 py-2 text-base sm:w-32"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm font-semibold">
          ¿Cómo te fue? (opcional)
          <input
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Usé la IA para responder 4 correos"
            className="rounded-xl border border-pro-border bg-pro-surface px-3 py-2 text-base"
          />
        </label>
        <button
          type="submit"
          disabled={busy || minutes === ''}
          className="rounded-xl bg-pro-accent px-4 py-2.5 text-sm font-bold text-pro-accent-ink hover:bg-pro-accent-hover disabled:opacity-50"
        >
          Guardar
        </button>
      </form>
      <button
        type="button"
        onClick={() => void save(0, 'No la apliqué')}
        disabled={busy}
        className="mt-3 text-sm font-semibold text-pro-muted underline-offset-2 hover:underline"
      >
        No alcancé a aplicarla
      </button>
      {error && <p className="mt-2 text-sm font-semibold text-pro-bad">{error}</p>}
    </section>
  )
}
