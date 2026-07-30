import { AnimatePresence, motion } from 'framer-motion'
import { IconShieldLock, IconTrophy } from '@tabler/icons-react'
import { useGamification } from '@/gamification/GamificationContext'
import { getOrCreateAlias } from '@/gamification/leagueStorage'
import { useAuth } from '@/features/auth/AuthContext'

export function LeagueWelcome() {
  const { leagueWelcomeVisible, closeLeagueWelcome } = useGamification()
  const { session } = useAuth()
  const alias = getOrCreateAlias(session?.user.id)

  return (
    <AnimatePresence>
      {leagueWelcomeVisible && (
        <motion.div
          key="league-welcome-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/95 p-4"
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 32 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 32 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl border border-gray-700 bg-gray-900 px-6 py-8 shadow-2xl"
          >
            <div className="relative">
              <span className="grid h-24 w-24 place-items-center rounded-full bg-violet-500/20 text-violet-300">
                <IconTrophy size={46} />
              </span>
              <motion.img
                src="/img/lumi/body.png"
                alt="Lumi celebrando"
                className="absolute -bottom-2 -right-7 h-16 w-16 object-contain"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-extrabold text-white">
                ¡Te uniste a la liga semanal!
              </h2>
              <p className="text-sm leading-relaxed text-gray-300">
                Cada actividad completada suma puntos. La clasificación vuelve a comenzar
                cada lunes.
              </p>
            </div>

            <div className="w-full rounded-2xl border border-gray-700 bg-gray-800 px-4 py-3 text-center">
              <p className="text-xs text-gray-400">Tu alias anónimo</p>
              <p className="mt-1 text-xl font-extrabold text-violet-400">{alias}</p>
              <p className="mt-2 flex items-center justify-center gap-1 text-xs text-gray-500">
                <IconShieldLock size={14} /> Nunca mostramos tu nombre real
              </p>
            </div>

            <button
              type="button"
              onClick={closeLeagueWelcome}
              className="w-full rounded-2xl bg-violet-600 py-3 font-bold text-white transition hover:bg-violet-500 active:scale-95"
            >
              Continuar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
