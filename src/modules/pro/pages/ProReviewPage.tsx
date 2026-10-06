import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IconCheck } from '@tabler/icons-react'
import { getQuestion } from '@/modules/pro/data/rutaRapida'
import { answerReview, recordActivity, type ProReview } from '@/modules/pro/lib/proStore'
import { usePro } from '@/modules/pro/lib/ProContext'
import QuestionCard from '@/modules/pro/components/QuestionCard'

function shuffle<T>(items: T[]) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// Repaso espaciado: preguntas de distintas lecciones mezcladas (intercalado).
// Si se acierta, la pregunta vuelve más tarde; si no, vuelve mañana.
export default function ProReviewPage() {
  const { due, userId, refresh } = usePro()
  // La lista se fija al entrar, para que no cambie mientras se responde.
  const [queue] = useState<ProReview[]>(() =>
    shuffle(due.filter((review) => getQuestion(review.question_id) !== null))
  )
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<boolean[]>([])
  const [error, setError] = useState('')

  if (queue.length === 0) {
    return (
      <section className="mx-auto max-w-xl rounded-2xl border border-pro-border bg-pro-surface p-6 text-center sm:p-8">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-pro-good-soft text-pro-good">
          <IconCheck size={26} />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold">No tienes repasos pendientes</h1>
        <p className="mt-3 text-base leading-7 text-pro-muted">
          Las preguntas de cada lección vuelven al día siguiente y después a los 3, 7 y 21 días.
          Vuelve mañana o sigue con una lección nueva.
        </p>
        <Link
          to="/pro"
          className="mt-6 inline-block rounded-xl bg-pro-accent px-5 py-3 text-base font-bold text-pro-accent-ink hover:bg-pro-accent-hover"
        >
          Ir a la ruta
        </Link>
      </section>
    )
  }

  if (index >= queue.length) {
    const correct = results.filter(Boolean).length
    return (
      <section className="mx-auto max-w-xl rounded-2xl border border-pro-border bg-pro-surface p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold">Repaso terminado</h1>
        <p className="mt-3 text-base leading-7 text-pro-muted">
          Recordaste {correct} de {queue.length}. Las que acertaste vuelven en más días; las otras
          vuelven mañana. Ese ir y volver es lo que fija lo aprendido.
        </p>
        <Link
          to="/pro"
          className="mt-6 inline-block rounded-xl bg-pro-accent px-5 py-3 text-base font-bold text-pro-accent-ink hover:bg-pro-accent-hover"
        >
          Volver al inicio
        </Link>
      </section>
    )
  }

  const review = queue[index]
  const found = getQuestion(review.question_id)
  if (!found) return null

  const handleDone = async (correct: boolean) => {
    setError('')
    try {
      await answerReview(review, correct)
      const nextResults = [...results, correct]
      setResults(nextResults)
      if (index + 1 >= queue.length) {
        // Cada pregunta toma cerca de medio minuto.
        await recordActivity(userId, Math.max(1, Math.ceil(queue.length / 2)))
        await refresh()
      }
      setIndex(index + 1)
    } catch (cause) {
      console.error('[Lumi Pro] No se pudo guardar el repaso:', cause)
      setError('No pudimos guardar tu respuesta. Revisa tu conexión e intenta de nuevo.')
    }
  }

  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Repaso de hoy</h1>
        <p className="mt-1 text-sm text-pro-muted">
          De la lección «{found.lesson.title}»
        </p>
      </div>
      <QuestionCard
        key={review.question_id}
        question={found.question}
        label={`Pregunta ${index + 1} de ${queue.length}`}
        onDone={(correct) => void handleDone(correct)}
      />
      {error && <p className="text-sm font-semibold text-pro-bad">{error}</p>}
    </section>
  )
}
