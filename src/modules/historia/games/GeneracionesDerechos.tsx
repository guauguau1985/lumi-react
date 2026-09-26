import { useState } from 'react'
import {
  DERECHOS_POR_GENERACION,
  GENERACIONES,
  barajar,
  type Generacion,
} from '@/modules/historia/data/derechosHumanos'
import { useGameRewards } from '@/gamification/useGameRewards'
import { useLearningTracker } from '@/shared/hooks/useLearningTracker'
import { useFeedback } from '@/adaptiveLearning/hook/useFeedback'
import Feedback from '@/shared/components/feedback/Feedback'

// Mismos colores que usaron en el cuaderno: 1ª roja, 2ª verde, 3ª morada.
const ESTILO: Record<Generacion, string> = {
  1: 'border-red-500 text-red-700',
  2: 'border-emerald-500 text-emerald-700',
  3: 'border-violet-500 text-violet-700',
}
const FONDO_OK: Record<Generacion, string> = {
  1: 'bg-red-50',
  2: 'bg-emerald-50',
  3: 'bg-violet-50',
}

export default function GeneracionesDerechos({ onSalir }: { onSalir: () => void }) {
  const [lista, setLista] = useState(() => barajar(DERECHOS_POR_GENERACION))
  const [paso, setPaso] = useState(0)
  const [aciertos, setAciertos] = useState(0)
  const [elegida, setElegida] = useState<Generacion | null>(null)
  const [terminado, setTerminado] = useState(false)

  const { onCorrect, onWrong, onGameCompleted } = useGameRewards('historia', 'generaciones-derechos')
  const { trackAnswer, trackComplete, resetTracker } = useLearningTracker({
    modulo: 'historia',
    tipoEjercicio: 'interactivo',
  })
  const { feedback, markCorrect, markWrong } = useFeedback()

  const actual = lista[paso]

  const elegir = (g: Generacion) => {
    if (elegida !== null) return
    setElegida(g)
    const ok = g === actual.generacion
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
    if (paso === lista.length - 1) {
      trackComplete()
      onGameCompleted({ aciertos, total: lista.length })
      setTerminado(true)
      return
    }
    setPaso((p) => p + 1)
    setElegida(null)
  }

  const reiniciar = () => {
    resetTracker()
    setLista(barajar(DERECHOS_POR_GENERACION))
    setPaso(0)
    setAciertos(0)
    setElegida(null)
    setTerminado(false)
  }

  if (terminado) {
    return (
      <div className="rounded-3xl border-2 border-violet-200 bg-white p-6 text-center shadow-sm sm:p-10">
        <p className="text-5xl font-black text-violet-600 sm:text-6xl">
          {aciertos}/{lista.length}
        </p>
        <p className="mt-3 text-lg font-black text-slate-800 sm:text-xl">
          {aciertos >= 11
            ? '¡Dominas las generaciones!'
            : aciertos >= 8
              ? '¡Bien! Revisa la ficha de generaciones.'
              : 'Lee la ficha “Las 3 generaciones” y vuelve a jugar.'}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reiniciar}
            className="rounded-2xl bg-violet-600 px-6 py-3 font-black text-white shadow-md transition hover:scale-105"
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

  const correcta = GENERACIONES[actual.generacion]
  const acerto = elegida === actual.generacion

  return (
    <div className="rounded-3xl border-2 border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
        <span className="whitespace-nowrap">
          Derecho {paso + 1} de {lista.length}
        </span>
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-violet-500 transition-all"
            style={{ width: `${(paso / lista.length) * 100}%` }}
          />
        </div>
        <span className="whitespace-nowrap text-emerald-600">✔ {aciertos}</span>
      </div>

      <div className="mt-4 rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center sm:py-8">
        <div className="text-5xl sm:text-6xl" aria-hidden>
          {actual.emoji}
        </div>
        <p className="mt-2 text-xl font-black text-slate-900 sm:text-2xl">{actual.derecho}</p>
      </div>

      <p className="mt-4 text-sm font-bold text-slate-500">¿De qué generación es?</p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {([1, 2, 3] as Generacion[]).map((g) => {
          const info = GENERACIONES[g]
          const marcar = elegida !== null && g === actual.generacion
          return (
            <button
              key={g}
              type="button"
              disabled={elegida !== null}
              onClick={() => elegir(g)}
              className={`rounded-2xl border-2 bg-white px-3 py-3 text-left transition ${ESTILO[g]} ${
                marcar ? FONDO_OK[g] : ''
              } ${elegida !== null && !marcar ? 'opacity-50' : ''}`}
            >
              <span className="block text-base font-black sm:text-lg">{info.nombre}</span>
              <span className="block text-xs font-semibold text-slate-600">{info.derechos}</span>
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
            <b>{acerto ? '¡Bien! ' : `Era de ${correcta.nombre}. `}</b>
            {correcta.derechos} · {correcta.contexto} · Sujeto: {correcta.sujeto.toLowerCase()}.
          </p>
          <button
            type="button"
            onClick={siguiente}
            className="rounded-2xl bg-violet-600 px-6 py-3 font-black text-white shadow-md"
          >
            {paso === lista.length - 1 ? 'Ver resultado' : 'Siguiente'}
          </button>
        </div>
      )}

      <Feedback state={feedback} successText="¡Muy bien!" errorText="Casi, mira la explicación" />
    </div>
  )
}
