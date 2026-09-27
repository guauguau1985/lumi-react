import { useState } from 'react'
import { FICHAS_LENGUAJE } from '@/modules/lenguaje/data/acentuacion'
import TextoConNegrita from '@/modules/historia/components/TextoConNegrita'
import { useGameRewards } from '@/gamification/useGameRewards'

const CLAVE_SABIDAS = 'lumi_lenguaje_fichas_sabidas'
const CLAVE_PREMIO = 'lumi_lenguaje_fichas_premio'

function leerSabidas(): Record<string, boolean> {
  try {
    const guardado = localStorage.getItem(CLAVE_SABIDAS)
    return guardado ? (JSON.parse(guardado) as Record<string, boolean>) : {}
  } catch {
    return {}
  }
}

export default function FichasLenguaje() {
  const [sabidas, setSabidas] = useState<Record<string, boolean>>(leerSabidas)
  const { onGameCompleted } = useGameRewards('lenguaje', 'repaso-lenguaje')

  const total = FICHAS_LENGUAJE.length
  const cuantas = FICHAS_LENGUAJE.filter((f) => sabidas[f.id]).length

  const alternar = (id: string) => {
    const nuevas = { ...sabidas, [id]: !sabidas[id] }
    setSabidas(nuevas)
    try {
      localStorage.setItem(CLAVE_SABIDAS, JSON.stringify(nuevas))
      const todas = FICHAS_LENGUAJE.every((f) => nuevas[f.id])
      if (todas && !localStorage.getItem(CLAVE_PREMIO)) {
        localStorage.setItem(CLAVE_PREMIO, '1')
        onGameCompleted({ ejercicios: total, correctas: total, accuracy: 100 })
      }
    } catch {
      // Sin almacenamiento: el repaso funciona igual, solo no se recuerda.
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-4">
        <div className="flex items-center justify-between gap-3 text-sm font-black text-sky-800">
          <span>
            Me sé {cuantas} de {total} fichas
          </span>
          <span>{Math.round((cuantas / total) * 100)}%</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-sky-500 transition-all"
            style={{ width: `${(cuantas / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FICHAS_LENGUAJE.map((ficha) => {
          const sabida = Boolean(sabidas[ficha.id])
          return (
            <article
              key={ficha.id}
              className={`flex flex-col gap-3 rounded-3xl border-2 p-4 shadow-sm transition sm:p-5 ${
                sabida ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'
              }`}
            >
              <h3 className="flex items-start gap-2 text-lg font-black leading-tight text-slate-900 sm:text-xl">
                <span aria-hidden>{ficha.emoji}</span>
                <span>{ficha.titulo}</span>
              </h3>
              <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-700 sm:text-base">
                {ficha.puntos.map((punto) => (
                  <li key={punto}>
                    <TextoConNegrita texto={punto} />
                  </li>
                ))}
              </ul>
              {ficha.clave && (
                <p className="rounded-2xl bg-amber-100 px-3 py-2 text-sm font-bold text-amber-900">
                  💡 {ficha.clave}
                </p>
              )}
              <button
                type="button"
                onClick={() => alternar(ficha.id)}
                className={`mt-auto self-start rounded-xl border-2 px-3 py-1.5 text-sm font-black transition ${
                  sabida
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-dashed border-slate-300 text-slate-500 hover:border-emerald-400 hover:text-emerald-700'
                }`}
              >
                {sabida ? '✔ Me la sé' : '¿Me la sé?'}
              </button>
            </article>
          )
        })}
      </div>
    </div>
  )
}
