import { useState, type FormEvent } from 'react'
import { PRO_AREAS, type ProAreaId } from '@/modules/pro/data/rutaRapida'
import { saveSettings } from '@/modules/pro/lib/proStore'
import { usePro } from '@/modules/pro/lib/ProContext'

// Primera visita: área de trabajo y un plan "si-entonces" para estudiar.
// Decidir de antemano cuándo y dónde estudiar aumenta mucho la probabilidad
// de hacerlo (Gollwitzer y Sheeran, 2006).
export default function ProOnboarding() {
  const { userId, refresh } = usePro()
  const [area, setArea] = useState<ProAreaId | ''>('')
  const [time, setTime] = useState('08:30')
  const [place, setPlace] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const plan = place.trim()
    ? `Si son las ${time} y estoy en ${place.trim()}, hago mi lección de Lumi Pro.`
    : ''

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!area) {
      setError('Elige tu área de trabajo.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await saveSettings(userId, area, plan)
      await refresh()
    } catch (cause) {
      console.error('[Lumi Pro] No se pudo guardar la configuración:', cause)
      setError('No pudimos guardar. Intenta de nuevo.')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        Aprende a usar IA en tu trabajo, 15 minutos al día
      </h1>
      <p className="mt-3 text-base leading-7 text-pro-muted">
        En 4 semanas vas a escribir, resumir y organizar tu trabajo con IA, sabiendo cuándo confiar
        en ella y cuándo no. Cada lección termina con preguntas que vuelven a aparecer en los días
        siguientes, para que lo aprendido se quede.
      </p>

      <fieldset className="mt-8">
        <legend className="text-base font-bold">¿En qué área trabajas?</legend>
        <p className="mt-1 text-sm text-pro-muted">El tutor usará ejemplos de tu área.</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {PRO_AREAS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setArea(item.id)}
              aria-pressed={area === item.id}
              className={`rounded-xl border px-4 py-3 text-left text-sm font-bold transition-colors ${
                area === item.id
                  ? 'border-pro-accent bg-pro-accent-soft text-pro-accent'
                  : 'border-pro-border bg-pro-surface hover:border-pro-accent'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-8">
        <legend className="text-base font-bold">¿Cuándo vas a hacer tu lección?</legend>
        <p className="mt-1 text-sm text-pro-muted">
          Elegir la hora y el lugar de antemano hace mucho más probable que lo cumplas.
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Hora
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="rounded-xl border border-pro-border bg-pro-surface px-3 py-2 text-base"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm font-semibold">
            Lugar o momento
            <input
              type="text"
              value={place}
              onChange={(event) => setPlace(event.target.value)}
              placeholder="la oficina, antes de abrir el correo"
              className="rounded-xl border border-pro-border bg-pro-surface px-3 py-2 text-base"
            />
          </label>
        </div>
        {plan && (
          <p className="mt-3 rounded-xl bg-pro-accent-soft px-4 py-3 text-sm font-semibold text-pro-accent">
            Tu plan: {plan}
          </p>
        )}
      </fieldset>

      {error && <p className="mt-4 text-sm font-semibold text-pro-bad">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="mt-8 w-full rounded-xl bg-pro-accent px-5 py-3 text-base font-bold text-pro-accent-ink hover:bg-pro-accent-hover disabled:opacity-60 sm:w-auto"
      >
        {busy ? 'Guardando…' : 'Empezar la ruta'}
      </button>
    </form>
  )
}
