import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { IconArrowLeft, IconBulb, IconCheck, IconSparkles } from '@tabler/icons-react'
import { getLesson, PRO_LESSONS } from '@/modules/pro/data/rutaRapida'
import { completeLesson, recordActivity } from '@/modules/pro/lib/proStore'
import { askPracticeFeedback } from '@/modules/pro/lib/proTutor'
import { usePro } from '@/modules/pro/lib/ProContext'
import QuestionCard from '@/modules/pro/components/QuestionCard'
import ProTutorChat from '@/modules/pro/components/ProTutorChat'

// Ciclo de cada lección (ver la investigación "Cómo aprenden IA los adultos").
const STEPS = ['Para qué', 'Ejemplo', 'Practica', 'Recuerda', 'Aplica'] as const

export default function ProLessonPage() {
  const { lessonId = '' } = useParams()
  // key: al pasar a la siguiente lección se reinicia todo el estado.
  return <LessonView key={lessonId} lessonId={lessonId} />
}

function LessonView({ lessonId }: { lessonId: string }) {
  const lesson = getLesson(lessonId)
  const { userId, settings, refresh } = usePro()

  const [step, setStep] = useState(0)
  const [practice, setPractice] = useState('')
  const [feedback, setFeedback] = useState('')
  const [feedbackBusy, setFeedbackBusy] = useState(false)
  const [feedbackError, setFeedbackError] = useState('')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Array<{ questionId: string; correct: boolean }>>([])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [finished, setFinished] = useState(false)

  if (!lesson) return <Navigate to="/pro" replace />

  const area = settings?.area ?? 'general'
  const nextLesson = PRO_LESSONS.find(
    (item) => item.week === lesson.week && item.order === lesson.order + 1
  )

  const requestFeedback = async () => {
    setFeedbackBusy(true)
    setFeedbackError('')
    try {
      const reply = await askPracticeFeedback({
        area,
        lessonTitle: lesson.title,
        lessonGoal: lesson.goal,
        instruction: lesson.practice.instruction,
        criteria: lesson.practice.criteria,
        practiceText: practice,
      })
      setFeedback(reply)
    } catch (cause) {
      setFeedbackError(cause instanceof Error ? cause.message : 'El tutor no respondió.')
    } finally {
      setFeedbackBusy(false)
    }
  }

  const finish = async () => {
    setSaving(true)
    setSaveError('')
    try {
      await completeLesson({ userId, lessonId: lesson.id, practiceText: practice, answers })
      await recordActivity(userId, lesson.minutes)
      await refresh()
      setFinished(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (cause) {
      console.error('[Lumi Pro] No se pudo guardar la lección:', cause)
      setSaveError('No pudimos guardar tu avance. Revisa tu conexión e intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const goTo = (next: number) => {
    setStep(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (finished) {
    const correct = answers.filter((answer) => answer.correct).length
    return (
      <section className="mx-auto max-w-2xl rounded-2xl border border-pro-border bg-pro-surface p-6 sm:p-8">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-pro-good-soft text-pro-good">
          <IconCheck size={26} />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold">Lección terminada</h1>
        <p className="mt-3 text-base leading-7 text-pro-muted">
          Respondiste {correct} de {answers.length} preguntas de memoria. Las {answers.length} vuelven
          mañana en tu repaso, y después a los 3, 7 y 21 días si las aciertas. Así se quedan.
        </p>
        <p className="mt-4 rounded-xl bg-pro-accent-soft px-4 py-3 text-sm leading-6 text-pro-ink">
          <span className="font-bold">Tu mini tarea de hoy: </span>
          {lesson.miniTask}
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          {nextLesson && (
            <Link
              to={`/pro/leccion/${nextLesson.id}`}
              onClick={() => window.scrollTo({ top: 0 })}
              className="rounded-xl border border-pro-border px-5 py-3 text-center text-base font-bold hover:border-pro-accent"
            >
              Ver la siguiente lección
            </Link>
          )}
          <Link
            to="/pro"
            className="rounded-xl bg-pro-accent px-5 py-3 text-center text-base font-bold text-pro-accent-ink hover:bg-pro-accent-hover"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    )
  }

  return (
    <article className="mx-auto max-w-2xl">
      <Link
        to="/pro"
        className="inline-flex items-center gap-1 text-sm font-bold text-pro-muted hover:text-pro-ink"
      >
        <IconArrowLeft size={16} /> Volver a la ruta
      </Link>
      <p className="mt-4 text-sm font-bold text-pro-accent">
        Semana {lesson.week} · Lección {lesson.order} · {lesson.minutes} min
      </p>
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{lesson.title}</h1>

      <ol className="mt-5 grid grid-cols-5 gap-1.5" aria-label="Pasos de la lección">
        {STEPS.map((label, index) => (
          <li key={label} className="flex flex-col gap-1">
            <span
              className={`h-1.5 rounded-full ${index <= step ? 'bg-pro-accent' : 'bg-pro-border'}`}
            />
            <span
              className={`text-[11px] font-bold sm:text-xs ${
                index === step ? 'text-pro-ink' : 'text-pro-muted'
              }`}
              aria-current={index === step ? 'step' : undefined}
            >
              {label}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-6">
        {step === 0 && (
          <section className="space-y-4">
            <div className="rounded-2xl border border-pro-border bg-pro-surface p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-pro-muted">
                Al terminar vas a poder
              </p>
              <p className="mt-2 text-lg font-bold leading-7">{lesson.goal}</p>
              <p className="mt-4 text-base leading-7 text-pro-muted">{lesson.why}</p>
            </div>
            <NextButton onClick={() => goTo(1)}>Ver el ejemplo</NextButton>
          </section>
        )}

        {step === 1 && (
          <section className="space-y-4">
            <p className="text-base leading-7">{lesson.example.intro}</p>
            <ol className="space-y-3">
              {lesson.example.steps.map((item) => (
                <li
                  key={`${item.label}-${item.text}`}
                  className="rounded-2xl border border-pro-border bg-pro-surface p-4 sm:p-5"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-pro-accent">
                    {item.label}
                  </p>
                  <p className="mt-1 text-base leading-7">{item.text}</p>
                  {item.note && (
                    <p className="mt-2 text-sm leading-6 text-pro-muted">{item.note}</p>
                  )}
                </li>
              ))}
            </ol>
            <p className="flex gap-2 rounded-xl bg-pro-accent-soft px-4 py-3 text-sm font-semibold leading-6 text-pro-ink">
              <IconBulb size={20} className="shrink-0 text-pro-accent" />
              {lesson.example.takeaway}
            </p>
            <NextButton onClick={() => goTo(2)}>Ahora practica tú</NextButton>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-4">
            <p className="text-base leading-7">{lesson.practice.instruction}</p>
            <textarea
              value={practice}
              onChange={(event) => setPractice(event.target.value)}
              placeholder={lesson.practice.placeholder}
              rows={7}
              aria-label="Tu práctica"
              className="w-full rounded-2xl border border-pro-border bg-pro-surface p-4 text-base leading-7"
            />
            <button
              type="button"
              onClick={() => void requestFeedback()}
              disabled={feedbackBusy || practice.trim().length < 10}
              className="inline-flex items-center gap-2 rounded-xl border border-pro-accent px-4 py-2.5 text-sm font-bold text-pro-accent hover:bg-pro-accent-soft disabled:opacity-50"
            >
              <IconSparkles size={18} />
              {feedbackBusy ? 'El tutor está revisando…' : 'Pedir revisión al tutor'}
            </button>
            {feedbackError && <p className="text-sm font-semibold text-pro-bad">{feedbackError}</p>}
            {feedback && (
              <ProTutorChat
                key={feedback}
                area={area}
                lessonTitle={lesson.title}
                lessonGoal={lesson.goal}
                initialMessages={[
                  { role: 'user', content: `Esta es mi práctica:\n${practice}` },
                  { role: 'assistant', content: feedback },
                ]}
              />
            )}
            <NextButton onClick={() => goTo(3)} disabled={practice.trim().length < 10}>
              Seguir a las preguntas
            </NextButton>
            {practice.trim().length < 10 && (
              <p className="text-sm text-pro-muted">
                Escribe tu práctica para continuar: es el paso donde más se aprende.
              </p>
            )}
          </section>
        )}

        {step === 3 && (
          <section className="space-y-4">
            <p className="text-base leading-7 text-pro-muted">
              Responde sin volver atrás. Recordar de memoria, aunque cueste, es lo que hace que el
              conocimiento dure.
            </p>
            <QuestionCard
              key={lesson.questions[questionIndex].id}
              question={lesson.questions[questionIndex]}
              label={`Pregunta ${questionIndex + 1} de ${lesson.questions.length}`}
              onDone={(correct) => {
                const question = lesson.questions[questionIndex]
                setAnswers((current) => [
                  ...current.filter((item) => item.questionId !== question.id),
                  { questionId: question.id, correct },
                ])
                if (questionIndex + 1 < lesson.questions.length) {
                  setQuestionIndex(questionIndex + 1)
                } else {
                  goTo(4)
                }
              }}
            />
          </section>
        )}

        {step === 4 && (
          <section className="space-y-4">
            <div className="rounded-2xl border border-pro-border bg-pro-surface p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-pro-muted">
                Tu mini tarea para hoy
              </p>
              <p className="mt-2 text-lg font-bold leading-7">{lesson.miniTask}</p>
              <p className="mt-3 text-sm leading-6 text-pro-muted">
                Aplicarlo el mismo día en tu trabajo es lo que convierte la lección en hábito.
                Mañana, al entrar, te preguntaremos cuántos minutos te ahorró.
              </p>
            </div>
            {saveError && <p className="text-sm font-semibold text-pro-bad">{saveError}</p>}
            <NextButton onClick={() => void finish()} disabled={saving}>
              {saving ? 'Guardando…' : 'Terminar la lección'}
            </NextButton>
          </section>
        )}
      </div>
    </article>
  )
}

function NextButton({
  children,
  onClick,
  disabled = false,
}: {
  children: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-xl bg-pro-accent px-5 py-3 text-base font-bold text-pro-accent-ink hover:bg-pro-accent-hover disabled:opacity-50 sm:w-auto"
    >
      {children}
    </button>
  )
}
