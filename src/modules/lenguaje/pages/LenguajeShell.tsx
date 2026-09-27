import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import FichasLenguaje from '@/modules/lenguaje/games/FichasLenguaje'
import QuizLenguaje from '@/modules/lenguaje/games/QuizLenguaje'
import {
  PREGUNTAS_LENGUAJE,
  TEMAS_LENGUAJE,
  type TemaLenguaje,
} from '@/modules/lenguaje/data/acentuacion'

type Actividad = { tipo: 'fichas' } | { tipo: 'ensayo' } | { tipo: 'tema'; tema: TemaLenguaje }

const POR_ENSAYO = 15

export default function LenguajeShell() {
  const [actividad, setActividad] = useState<Actividad | null>(null)
  const volver = () => setActividad(null)

  const titulo =
    actividad?.tipo === 'fichas'
      ? '📒 Fichas de repaso'
      : actividad?.tipo === 'ensayo'
        ? '🎯 Ensayo de la prueba'
        : actividad?.tipo === 'tema'
          ? `${TEMAS_LENGUAJE.find((t) => t.tema === actividad.tema)?.emoji ?? ''} ${actividad.tema}`
          : null

  return (
    <div className="min-h-svh bg-[var(--color-background)] text-[var(--color-foreground)]">
      <header className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <h1 className="text-xl font-extrabold text-sky-700 sm:text-2xl">📝 Lenguaje</h1>
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
        <section className="bg-gradient-to-br from-sky-300 via-emerald-200 to-violet-300 px-4 py-8 text-slate-900 sm:py-10">
          <div className="mx-auto max-w-4xl">
            <p className="text-xs font-black uppercase tracking-wide opacity-70">
              Guía de estudio · Septiembre
            </p>
            <h2 className="mt-1 text-2xl font-extrabold sm:text-4xl">Misión Tildes ✍️</h2>
            <p className="mt-2 max-w-xl text-base font-semibold opacity-90 sm:text-lg">
              Reglas de acentuación, acento dierético, diacrítico y uso de C, S y Z. Estudia para tu
              prueba jugando.
            </p>
          </div>
        </section>
      )}

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        {!actividad && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TarjetaActividad
                emoji="📒"
                titulo="Fichas de repaso"
                descripcion="Toda la materia de la guía. Marca las que ya te sabes."
                colores="border-slate-200 bg-white text-slate-800"
                onClick={() => setActividad({ tipo: 'fichas' })}
              />
              <TarjetaActividad
                emoji="🎯"
                titulo={`Ensayo de la prueba (${POR_ENSAYO})`}
                descripcion="Preguntas al azar de todos los temas, como en la prueba."
                colores="border-sky-300 bg-sky-100 text-sky-900"
                onClick={() => setActividad({ tipo: 'ensayo' })}
              />
            </div>

            <div>
              <h3 className="mb-3 text-base font-black text-slate-700 sm:text-lg">
                Practica tema por tema
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {TEMAS_LENGUAJE.map((t) => {
                  const n = PREGUNTAS_LENGUAJE.filter((p) => p.tema === t.tema).length
                  return (
                    <TarjetaActividad
                      key={t.tema}
                      emoji={t.emoji}
                      titulo={t.tema}
                      descripcion={`${t.descripcion} (${n} preguntas)`}
                      colores={t.colores}
                      onClick={() => setActividad({ tipo: 'tema', tema: t.tema })}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {titulo && <h2 className="mb-4 text-xl font-black text-slate-800 sm:text-2xl">{titulo}</h2>}

        {actividad?.tipo === 'fichas' && <FichasLenguaje />}
        {actividad?.tipo === 'ensayo' && (
          <QuizLenguaje
            preguntas={PREGUNTAS_LENGUAJE}
            cantidad={POR_ENSAYO}
            gameId="ensayo-lenguaje"
            topic="acentuación y ortografía"
            onSalir={volver}
          />
        )}
        {actividad?.tipo === 'tema' && (
          <QuizLenguaje
            key={actividad.tema}
            preguntas={PREGUNTAS_LENGUAJE.filter((p) => p.tema === actividad.tema)}
            cantidad={100}
            gameId="practica-lenguaje"
            topic={actividad.tema}
            onSalir={volver}
          />
        )}
      </main>
    </div>
  )
}

function TarjetaActividad({
  emoji,
  titulo,
  descripcion,
  colores,
  onClick,
}: {
  emoji: string
  titulo: string
  descripcion: string
  colores: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 rounded-3xl border-2 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${colores}`}
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/80 text-2xl">
        {emoji}
      </span>
      <span>
        <span className="block text-base font-black sm:text-lg">{titulo}</span>
        <span className="mt-0.5 block text-sm font-semibold opacity-80">{descripcion}</span>
      </span>
    </button>
  )
}
