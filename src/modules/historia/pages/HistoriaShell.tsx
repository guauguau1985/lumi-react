import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import RepasoFichas from '@/modules/historia/games/RepasoFichas'
import QuizDerechos from '@/modules/historia/games/QuizDerechos'
import GeneracionesDerechos from '@/modules/historia/games/GeneracionesDerechos'
import MemoriceDerechos from '@/modules/historia/games/MemoriceDerechos'

type Actividad = 'repaso' | 'quiz' | 'generaciones' | 'memorice'

const ACTIVIDADES: {
  id: Actividad
  emoji: string
  titulo: string
  descripcion: string
  colores: string
}[] = [
  {
    id: 'repaso',
    emoji: '📒',
    titulo: 'Fichas de repaso',
    descripcion: 'Toda la materia del cuaderno, ordenada. Marca las que ya te sabes.',
    colores: 'border-rose-200 bg-rose-50 text-rose-800',
  },
  {
    id: 'quiz',
    emoji: '❓',
    titulo: 'Quiz de 10 preguntas',
    descripcion: 'Preguntas al azar con explicación. Ganas puntos por cada acierto.',
    colores: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  {
    id: 'generaciones',
    emoji: '🧭',
    titulo: '¿De qué generación es?',
    descripcion: 'Clasifica derechos en 1ª, 2ª o 3ª generación.',
    colores: 'border-violet-200 bg-violet-50 text-violet-800',
  },
  {
    id: 'memorice',
    emoji: '🃏',
    titulo: 'Memorice de conceptos',
    descripcion: 'Une cada palabra con su significado.',
    colores: 'border-sky-200 bg-sky-50 text-sky-800',
  },
]

export default function HistoriaShell() {
  const [actividad, setActividad] = useState<Actividad | null>(null)
  const volver = () => setActividad(null)
  const actual = ACTIVIDADES.find((a) => a.id === actividad)

  return (
    <div className="min-h-svh bg-[var(--color-background)] text-[var(--color-foreground)]">
      <header className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <h1 className="text-xl font-extrabold text-rose-700 sm:text-2xl">🏛️ Historia</h1>
        {actividad ? (
          <button
            type="button"
            onClick={volver}
            className="rounded-lg border border-[var(--color-card-border)] bg-[var(--color-surface)] px-3 py-1 shadow-sm"
          >
            ⬅️ Actividades
          </button>
        ) : (
          <NavLink
            to="/"
            className="rounded-lg border border-[var(--color-card-border)] bg-[var(--color-surface)] px-3 py-1 shadow-sm"
          >
            ⬅️ Inicio
          </NavLink>
        )}
      </header>

      {!actividad && (
        <section className="bg-gradient-to-br from-rose-300 via-amber-200 to-violet-300 px-4 py-8 text-slate-900 sm:py-10">
          <div className="mx-auto max-w-4xl">
            <p className="text-xs font-black uppercase tracking-wide opacity-70">
              Unidad 4 · Formación ciudadana · 5° básico
            </p>
            <h2 className="mt-1 text-2xl font-extrabold sm:text-4xl">Misión Derechos ⚖️</h2>
            <p className="mt-2 max-w-xl text-base font-semibold opacity-90 sm:text-lg">
              Derechos humanos, el Estado y nuestros deberes. Estudia para tu prueba jugando.
            </p>
          </div>
        </section>
      )}

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        {!actividad && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ACTIVIDADES.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setActividad(a.id)}
                className={`flex items-start gap-3 rounded-3xl border-2 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${a.colores}`}
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/80 text-2xl">
                  {a.emoji}
                </span>
                <span>
                  <span className="block text-base font-black sm:text-lg">{a.titulo}</span>
                  <span className="mt-0.5 block text-sm font-semibold opacity-80">{a.descripcion}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {actual && (
          <h2 className="mb-4 text-xl font-black text-slate-800 sm:text-2xl">
            {actual.emoji} {actual.titulo}
          </h2>
        )}
        {actividad === 'repaso' && <RepasoFichas />}
        {actividad === 'quiz' && <QuizDerechos onSalir={volver} />}
        {actividad === 'generaciones' && <GeneracionesDerechos onSalir={volver} />}
        {actividad === 'memorice' && <MemoriceDerechos onSalir={volver} />}
      </main>
    </div>
  )
}
