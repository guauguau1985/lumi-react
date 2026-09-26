import { useState } from 'react'
import { PREGUNTAS, barajar, type PreguntaQuiz } from '@/modules/historia/data/derechosHumanos'
import { useGameRewards } from '@/gamification/useGameRewards'
import { useLearningTracker } from '@/shared/hooks/useLearningTracker'
import { useFeedback } from '@/adaptiveLearning/hook/useFeedback'
import Feedback from '@/shared/components/feedback/Feedback'
import TutorWidget from '@/shared/components/tutor/TutorWidget'

const POR_RONDA = 10

interface PreguntaMezclada extends PreguntaQuiz {
  mezcla: { texto: string; correcta: boolean }[]
}

function nuevaRonda(): PreguntaMezclada[] {
  return barajar(PREGUNTAS)
    .slice(0, POR_RONDA)
    .map((p) => ({
      ...p,
      mezcla: barajar(p.opciones.map((texto, i) => ({ texto, correcta: i === 0 }))),
    }))
}

export default function QuizDerechos({ onSalir }: { onSalir: () => void }) {
  const [ronda, setRonda] = useState<PreguntaMezclada[]>(nuevaRonda)
  const [paso, setPaso] = useState(0)
  const [aciertos, setAciertos] = useState(0)
  const [elegida, setElegida] = useState<number | null>(null)
  const [terminado, setTerminado] = useState(false)

  const { onCorrect, onWrong, onGameCompleted } = useGameRewards('historia', 'quiz-derechos')
  const { state, trackAnswer, trackComplete, resetTracker } = useLearningTracker({
    modulo: 'historia',
    tipoEjercicio: 'texto',
  })
  const { feedback, markCorrect, markWrong } = useFeedback()

  const actual = ronda[paso]

  const responder = (indice: number) => {
    if (elegida !== null) return
    setElegida(indice)
    const ok = actual.mezcla[indice].correcta
    trackAnswer(ok)
    if (ok) {
      setAciertos((a) => a + 1)
      onCorrect()
      markCorrect()
    } else {
      onWrong()
      markWrong()
    }
  }

  const siguiente = () => {
    if (paso === ronda.length - 1) {
      trackComplete()
      onGameCompleted({ aciertos, total: ronda.length })
      setTerminado(true)
      return
    }
    setPaso((p) => p + 1)
    setElegida(null)
  }

  const reiniciar = () => {
    resetTracker()
    setRonda(nuevaRonda())
    setPaso(0)
    setAciertos(0)
    setElegida(null)
    setTerminado(false)
  }

  if (terminado) {
    const mensaje =
      aciertos >= 9
        ? '¡Estás listo para la prueba!'
        : aciertos >= 7
          ? '¡Muy bien! Repasa las que fallaste.'
          : aciertos >= 5
            ? 'Vas bien. Lee las fichas y vuelve a intentarlo.'
            : 'Repasa las fichas y juega otra vez.'
    return (
      <div className="rounded-3xl border-2 border-rose-200 bg-white p-6 text-center shadow-sm sm:p-10">
        <p className="text-5xl font-black text-rose-600 sm:text-6xl">
          {aciertos}/{ronda.length}
        </p>
        <p className="mt-3 text-lg font-black text-slate-800 sm:text-xl">{mensaje}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reiniciar}
            className="rounded-2xl bg-rose-600 px-6 py-3 font-black text-white shadow-md transition hover:scale-105"
          >
            Jugar otra vez
          </button>
          <button
            type="button"
            onClick={onSalir}
            className="rounded-2xl border-2 border-slate-200 bg-white px-6 py-3 font-bold text-slate-700"
          >
            Volver a Historia
          </button>
        </div>
      </div>
    )
  }

  const correctaIndice = actual.mezcla.findIndex((o) => o.correcta)
  const acerto = elegida !== null && elegida === correctaIndice

  return (
    <div className="rounded-3xl border-2 border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
        <span className="whitespace-nowrap">
          Pregunta {paso + 1} de {ronda.length}
        </span>
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-rose-500 transition-all"
            style={{ width: `${(paso / ronda.length) * 100}%` }}
          />
        </div>
        <span className="whitespace-nowrap text-emerald-600">✔ {aciertos}</span>
      </div>

      <p className="mt-4 text-lg font-black leading-snug text-slate-900 sm:text-2xl">
        {actual.pregunta}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {actual.mezcla.map((opcion, i) => {
          const esCorrecta = elegida !== null && opcion.correcta
          const esError = elegida === i && !opcion.correcta
          return (
            <button
              key={opcion.texto}
              type="button"
              disabled={elegida !== null}
              onClick={() => responder(i)}
              className={`rounded-2xl border-2 px-4 py-3 text-left text-sm font-bold transition sm:text-base ${
                esCorrecta
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : esError
                    ? 'border-red-400 bg-red-50 text-red-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-rose-300'
              }`}
            >
              {opcion.texto}
            </button>
          )
        })}
      </div>

      {elegida !== null && (
        <div className="mt-4 space-y-3">
          <p
            className={`rounded-2xl px-4 py-3 text-sm font-semibold sm:text-base ${
              acerto ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'
            }`}
          >
            <b>{acerto ? '¡Correcto! ' : 'Casi… '}</b>
            {actual.explicacion}
          </p>
          <button
            type="button"
            onClick={siguiente}
            className="rounded-2xl bg-rose-600 px-6 py-3 font-black text-white shadow-md"
          >
            {paso === ronda.length - 1 ? 'Ver resultado' : 'Siguiente'}
          </button>
        </div>
      )}

      <Feedback state={feedback} successText="¡Respuesta correcta!" errorText="Casi, sigue intentando" />
      <TutorWidget
        topic="derechos humanos y el Estado"
        level={state.currentLevel}
        errorStreak={state.errorStreak}
        attempts={state.totalAnswers}
      />
    </div>
  )
}
