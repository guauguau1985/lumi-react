import { useEffect, useRef, useState } from 'react'
import { PAREJAS_MEMORICE, barajar } from '@/modules/historia/data/derechosHumanos'
import { useGameRewards } from '@/gamification/useGameRewards'
import { useLearningTracker } from '@/shared/hooks/useLearningTracker'

interface Carta {
  clave: string
  pareja: number
  texto: string
  esConcepto: boolean
}

function nuevoMazo(): Carta[] {
  const cartas: Carta[] = PAREJAS_MEMORICE.flatMap((p, i) => [
    { clave: `c${i}`, pareja: i, texto: p.concepto, esConcepto: true },
    { clave: `s${i}`, pareja: i, texto: p.significado, esConcepto: false },
  ])
  return barajar(cartas)
}

export default function MemoriceDerechos({ onSalir }: { onSalir: () => void }) {
  const [mazo, setMazo] = useState<Carta[]>(nuevoMazo)
  const [abiertas, setAbiertas] = useState<number[]>([])
  const [encontradas, setEncontradas] = useState<Set<number>>(() => new Set())
  const [movimientos, setMovimientos] = useState(0)
  const temporizador = useRef<number | null>(null)

  const { onCorrect, onWrong, onGameCompleted } = useGameRewards('historia', 'memorice-derechos')
  const { trackAnswer, trackComplete, resetTracker } = useLearningTracker({
    modulo: 'historia',
    tipoEjercicio: 'visual',
  })

  useEffect(
    () => () => {
      if (temporizador.current != null) window.clearTimeout(temporizador.current)
    },
    [],
  )

  const terminado = encontradas.size === PAREJAS_MEMORICE.length

  const voltear = (indice: number) => {
    const carta = mazo[indice]
    if (abiertas.length === 2 || abiertas.includes(indice) || encontradas.has(carta.pareja)) return

    const nuevas = [...abiertas, indice]
    setAbiertas(nuevas)
    if (nuevas.length < 2) return

    setMovimientos((m) => m + 1)
    const [a, b] = nuevas.map((i) => mazo[i])
    const ok = a.pareja === b.pareja && a.esConcepto !== b.esConcepto
    trackAnswer(ok)

    if (ok) {
      onCorrect()
      const siguiente = new Set(encontradas).add(a.pareja)
      setEncontradas(siguiente)
      setAbiertas([])
      if (siguiente.size === PAREJAS_MEMORICE.length) {
        trackComplete()
        onGameCompleted({ movimientos: movimientos + 1 })
      }
    } else {
      onWrong()
      temporizador.current = window.setTimeout(() => {
        setAbiertas([])
        temporizador.current = null
      }, 1100)
    }
  }

  const reiniciar = () => {
    if (temporizador.current != null) window.clearTimeout(temporizador.current)
    resetTracker()
    setMazo(nuevoMazo())
    setAbiertas([])
    setEncontradas(new Set())
    setMovimientos(0)
  }

  return (
    <div className="rounded-3xl border-2 border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-slate-500">
        <span>
          Movimientos: {movimientos} · Parejas: {encontradas.size} de {PAREJAS_MEMORICE.length}
        </span>
        <button
          type="button"
          onClick={reiniciar}
          className="rounded-full border-2 border-slate-200 px-3 py-1 text-xs font-black text-slate-600"
        >
          Barajar de nuevo
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
        {mazo.map((carta, i) => {
          const hallada = encontradas.has(carta.pareja)
          const visible = hallada || abiertas.includes(i)
          return (
            <button
              key={carta.clave}
              type="button"
              onClick={() => voltear(i)}
              aria-label={visible ? carta.texto : 'Carta tapada'}
              className={`flex aspect-square max-w-full items-center justify-center overflow-hidden rounded-2xl border-2 p-2 text-center leading-tight transition sm:aspect-[4/3] ${
                hallada
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                  : visible
                    ? 'border-sky-400 bg-white text-slate-800'
                    : 'border-sky-700 bg-sky-600 text-white hover:bg-sky-500'
              } ${visible && carta.esConcepto ? 'text-sm font-black sm:text-lg' : 'text-[11px] font-bold sm:text-sm'}`}
            >
              {visible ? carta.texto : <span className="text-3xl font-black text-amber-300">?</span>}
            </button>
          )
        })}
      </div>

      {terminado && (
        <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-center">
          <p className="text-lg font-black text-emerald-800">
            ¡Completado en {movimientos} movimientos!
          </p>
          <p className="text-sm font-semibold text-emerald-700">
            {movimientos <= 14 ? '¡Memoria de campeón!' : 'Intenta hacerlo en 14 movimientos o menos.'}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={reiniciar}
              className="rounded-2xl bg-sky-600 px-5 py-2.5 font-black text-white"
            >
              Jugar otra vez
            </button>
            <button
              type="button"
              onClick={onSalir}
              className="rounded-2xl border-2 border-slate-200 bg-white px-5 py-2.5 font-bold text-slate-700"
            >
              Volver a Historia
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
