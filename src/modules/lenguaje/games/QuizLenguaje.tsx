import { useState } from 'react'
import type { PreguntaLenguaje } from '@/modules/lenguaje/data/acentuacion'
import { barajar } from '@/modules/historia/data/derechosHumanos'
import { useGameRewards } from '@/gamification/useGameRewards'
import { useLearningTracker } from '@/shared/hooks/useLearningTracker'
import { useFeedback } from '@/adaptiveLearning/hook/useFeedback'
import Feedback from '@/shared/components/feedback/Feedback'
import TutorWidget from '@/shared/components/tutor/TutorWidget'

interface PreguntaMezclada extends PreguntaLenguaje {
  mezcla: { texto: string; correcta: boolean }[]
}

interface Props {
  preguntas: PreguntaLenguaje[]
  cantidad: number
  gameId: 'ensayo-lenguaje' | 'practica-lenguaje'
  topic: string
  onSalir: () => void
}

function nuevaRonda(preguntas: PreguntaLenguaje[], cantidad: number): PreguntaMezclada[] {
  return barajar(preguntas)
    .slice(0, cantidad)
    .map((p) => ({
      ...p,
      mezcla: barajar(p.opciones.map((texto, i) => ({ texto, correcta: i === 0 }))),
    }))
}

export default function QuizLenguaje({ preguntas, cantidad, gameId, topic, onSalir }: Props) {
  const [ronda, setRonda] = useState<PreguntaMezclada[]>(() => nuevaRonda(preguntas, cantidad))
  const [paso, setPaso] = useState(0)
  const [aciertos, setAciertos] = useState(0)
  const [elegida, setElegida] = useState<number | null>(null)
  const [falladas, setFalladas] = useState<PreguntaMezclada[]>([])
  const [terminado, setTerminado] = useState(false)

  const { onCorrect, onWrong, onGameCompleted } = useGameRewards('lenguaje', gameId)
  const { state, trackAnswer, trackComplete, resetTracker } = useLearningTracker({
    modulo: 'lenguaje',
    tipoEjercicio: 'texto',
    topic,
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
      setFalladas((f) => [...f, actual])
      onWrong()
      markWrong()
    }
  }

  const siguiente = () => {
    if (paso === ronda.length - 1) {
      trackComplete()
      onGameCompleted({
        ejercicios: ronda.length,
        correctas: aciertos,
        accuracy: Math.round((aciertos / ronda.length) * 100),
      })
      setTerminado(true)
      return
    }
    setPaso((p) => p + 1)
    setElegida(null)
  }

  const reiniciar = (pool: PreguntaLenguaje[], n: number) => {
    resetTracker()
    setRonda(nuevaRonda(pool, n))
    setPaso(0)
    setAciertos(0)
    setElegida(null)
    setFalladas([])
    setTerminado(false)
  }

  if (terminado) {
    const pct = aciertos / ronda.length
    const mensaje =
      pct >= 0.9
        ? '¡Estás listo para la prueba!'
        : pct >= 0.7
          ? '¡Muy bien! Repasa las que fallaste.'
          : pct >= 0.5
            ? 'Vas bien. Lee las fichas y vuelve a intentarlo.'
            : 'Repasa las fichas y juega otra vez.'
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border-2 border-sky-200 bg-white p-6 text-center shadow-sm sm:p-10">
          <p className="text-5xl font-black text-sky-600 sm:text-6xl">
            {aciertos}/{ronda.length}
          </p>
          <p className="mt-3 text-lg font-black text-slate-800 sm:text-xl">{mensaje}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {falladas.length > 0 && (
              <button
                type="button"
                onClick={() => reiniciar(falladas, falladas.length)}
                className="rounded-2xl bg-amber-500 px-6 py-3 font-black text-white shadow-md transition hover:scale-105"
              >
                Practicar las {falladas.length} que fallé
              </button>
            )}
            <button
              type="button"
              onClick={() => reiniciar(preguntas, cantidad)}
              className="rounded-2xl bg-sky-600 px-6 py-3 font-black text-white shadow-md transition hover:scale-105"
            >
              Jugar otra vez
            </button>
            <button
              type="button"
              onClick={onSalir}
              className="rounded-2xl border-2 border-slate-200 bg-white px-6 py-3 font-bold text-slate-700"
            >
              Volver a Lenguaje
            </button>
          </div>
        </div>

        {falladas.length > 0 && (
          <div className="rounded-3xl border-2 border-amber-200 bg-amber-50 p-4 sm:p-6">
            <h3 className="text-base font-black text-amber-900 sm:text-lg">📌 Para repasar</h3>
            <ul className="mt-2 space-y-2 text-sm text-amber-900 sm:text-base">
              {falladas.map((p, i) => (
                <li key={i} className="rounded-2xl bg-white/70 px-3 py-2">
                  <b>{p.pregunta}</b> → {p.opciones[0]}
                  <span className="block opacity-80">{p.explicacion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
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
            className="h-full rounded-full bg-sky-500 transition-all"
            style={{ width: `${(paso / ronda.length) * 100}%` }}
          />
        </div>
        <span className="whitespace-nowrap text-emerald-600">✔ {aciertos}</span>
      </div>

      <p className="mt-4 text-xs font-black uppercase tracking-wide text-sky-700">{actual.tema}</p>
      <div className="mt-1 flex items-start gap-3">
        <span className="text-3xl sm:text-4xl" aria-hidden>
          {actual.emoji}
        </span>
        <p className="text-lg font-black leading-snug text-slate-900 sm:text-2xl">{actual.pregunta}</p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {actual.mezcla.map((opcion, i) => {
          const esCorrecta = elegida !== null && opcion.correcta
          const esError = elegida === i && !opcion.correcta
          return (
            <button
              key={i}
              type="button"
              disabled={elegida !== null}
              onClick={() => responder(i)}
              className={`rounded-2xl border-2 px-4 py-3 text-left text-base font-bold transition sm:text-lg ${
                esCorrecta
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : esError
                    ? 'border-red-400 bg-red-50 text-red-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300'
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
            className="rounded-2xl bg-sky-600 px-6 py-3 font-black text-white shadow-md"
          >
            {paso === ronda.length - 1 ? 'Ver resultado' : 'Siguiente'}
          </button>
        </div>
      )}

      <Feedback state={feedback} successText="¡Respuesta correcta!" errorText="Casi, sigue intentando" />
      <TutorWidget
        topic={`acentuación y ortografía: ${actual.tema}`}
        level={state.currentLevel}
        errorStreak={state.errorStreak}
        attempts={state.totalAnswers}
      />
    </div>
  )
}
