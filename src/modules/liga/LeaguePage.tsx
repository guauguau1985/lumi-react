import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  IconArrowLeft,
  IconBolt,
  IconFlag,
  IconMedal,
  IconShieldLock,
  IconTrophy,
} from '@tabler/icons-react'
import {
  type LeagueEntry,
  getOrCreateAlias,
  getSemanaActual,
  getTopLeague,
  msHastaProximoLunes,
} from '@/gamification/leagueStorage'
import { useAuth } from '@/features/auth/AuthContext'

function formatCountdown(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor((totalSeconds % 86_400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (days > 0) return `${days}d ${String(hours).padStart(2, '0')}h`
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function LeaguePage() {
  const { session } = useAuth()
  const [entries, setEntries] = useState<LeagueEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState(msHastaProximoLunes())
  const userId = session?.user.id
  const alias = getOrCreateAlias(userId)

  useEffect(() => {
    void getTopLeague(userId).then((data) => {
      setEntries(data)
      setLoading(false)
    })
  }, [userId])

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(msHastaProximoLunes()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const isInTop = entries.some((entry) => entry.esMio)

  return (
    <div className="min-h-screen bg-gray-950 pb-10 text-white">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-3">
        <NavLink
          to="/"
          className="inline-flex items-center gap-1 text-sm text-gray-400 transition hover:text-white"
        >
          <IconArrowLeft size={17} /> Inicio
        </NavLink>
        <h1 className="flex items-center gap-2 text-lg font-extrabold">
          <IconTrophy size={21} className="text-yellow-400" /> Liga semanal
        </h1>
        <div className="font-mono text-xs text-gray-400">{formatCountdown(countdown)}</div>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-4 pt-4">
        <p className="text-center text-xs text-gray-500">
          Semana {getSemanaActual()} · Vuelve a comenzar el lunes a las 00:00
        </p>

        <section className="flex items-center justify-between rounded-2xl border border-gray-700 bg-gray-800 px-4 py-3">
          <div>
            <p className="text-xs text-gray-400">Tu alias</p>
            <p className="font-bold text-violet-400">{alias}</p>
          </div>
          <span className="flex max-w-44 items-center gap-1 text-right text-xs text-gray-500">
            <IconShieldLock size={16} className="shrink-0" /> Tu nombre real es privado
          </span>
        </section>

        {loading ? (
          <div className="flex justify-center py-12">
            <motion.div
              className="h-8 w-8 rounded-full border-4 border-violet-500 border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : entries.length === 0 ? (
          <section className="space-y-3 py-12 text-center text-gray-400">
            <IconFlag size={42} className="mx-auto text-gray-600" />
            <p className="font-bold">Completa una actividad para entrar en la liga.</p>
            <p className="text-xs">Tu primer puntaje aparecerá aquí.</p>
          </section>
        ) : (
          <section className="space-y-1">
            {entries.map((entry, index) => {
              const position = index + 1
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                    entry.esMio
                      ? 'border border-violet-500/50 bg-violet-500/20'
                      : 'bg-gray-800'
                  }`}
                >
                  <span className="grid w-8 place-items-center text-sm font-bold">
                    {position <= 3 ? (
                      <IconMedal
                        size={22}
                        className={
                          position === 1
                            ? 'text-yellow-400'
                            : position === 2
                              ? 'text-slate-300'
                              : 'text-orange-400'
                        }
                      />
                    ) : (
                      position
                    )}
                  </span>
                  <span
                    className={`flex-1 text-sm font-semibold ${
                      entry.esMio ? 'text-violet-300' : 'text-gray-200'
                    }`}
                  >
                    {entry.alias}
                    {entry.esMio && (
                      <span className="ml-1 text-xs text-violet-400">(tú)</span>
                    )}
                  </span>
                  <span className="flex items-center gap-1 text-sm font-bold text-yellow-400">
                    <IconBolt size={16} /> {entry.xp_semanal}
                  </span>
                </motion.div>
              )
            })}

            {!isInTop && (
              <p className="py-4 text-center text-xs text-gray-500">
                {alias} aún no está en el top 20. Completa actividades para subir.
              </p>
            )}
          </section>
        )}

        <p className="flex items-start justify-center gap-1 text-center text-xs leading-relaxed text-gray-600">
          <IconShieldLock size={15} className="mt-0.5 shrink-0" />
          La liga solo muestra alias generados. Nunca publica nombre, edad, ciudad ni
          correo.
        </p>
      </main>
    </div>
  )
}
