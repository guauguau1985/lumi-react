import { useState } from 'react'
import { IconCheck, IconX } from '@tabler/icons-react'
import type { ProQuestion } from '@/modules/pro/data/rutaRapida'

interface QuestionCardProps {
  question: ProQuestion
  /** Texto pequeño sobre la pregunta, por ejemplo "Pregunta 2 de 3". */
  label?: string
  onDone: (correct: boolean) => void
}

// Pregunta de recuperación: se responde de memoria y se ve la explicación
// de inmediato (práctica de recuperación con retroalimentación).
export default function QuestionCard({ question, label, onDone }: QuestionCardProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const answered = selected !== null
  const correct = selected === question.correctIndex

  return (
    <div className="rounded-2xl border border-pro-border bg-pro-surface p-5 sm:p-6">
      {label && <p className="text-xs font-bold uppercase tracking-wide text-pro-muted">{label}</p>}
      <p className="mt-1 text-lg font-bold leading-7">{question.prompt}</p>

      <div className="mt-4 flex flex-col gap-2">
        {question.options.map((option, index) => {
          const isCorrect = index === question.correctIndex
          const isSelected = index === selected
          let style = 'border-pro-border bg-pro-surface hover:border-pro-accent'
          if (answered && isCorrect) style = 'border-pro-good bg-pro-good-soft'
          else if (answered && isSelected) style = 'border-pro-bad bg-pro-bad-soft'
          else if (answered) style = 'border-pro-border bg-pro-surface opacity-60'

          return (
            <button
              key={option}
              type="button"
              disabled={answered}
              onClick={() => setSelected(index)}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-base transition-colors ${style}`}
            >
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center">
                {answered && isCorrect && <IconCheck size={18} className="text-pro-good" />}
                {answered && isSelected && !isCorrect && <IconX size={18} className="text-pro-bad" />}
              </span>
              <span>{option}</span>
            </button>
          )
        })}
      </div>

      {answered && (
        <div
          className={`mt-4 rounded-xl px-4 py-3 text-sm leading-6 ${
            correct ? 'bg-pro-good-soft text-pro-good' : 'bg-pro-warn-soft text-pro-warn'
          }`}
          role="status"
        >
          <p className="font-bold">{correct ? 'Correcto.' : 'No era esa, pero ahora la vas a recordar.'}</p>
          <p className="mt-1 text-pro-ink">{question.explanation}</p>
        </div>
      )}

      {answered && (
        <button
          type="button"
          onClick={() => onDone(correct)}
          className="mt-4 w-full rounded-xl bg-pro-accent px-5 py-3 text-base font-bold text-pro-accent-ink hover:bg-pro-accent-hover sm:w-auto"
        >
          Continuar
        </button>
      )}
    </div>
  )
}
