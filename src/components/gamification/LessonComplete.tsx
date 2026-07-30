import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, type ComponentType } from 'react'
import { IconBolt, IconClipboardCheck, IconTargetArrow } from '@tabler/icons-react'
import { useGamification } from '@/gamification/GamificationContext'
import { useAuth } from '@/features/auth/AuthContext'
import { supabase } from '@/shared/lib/supabaseClient'
import { getDeviceId, getSessionId } from '@/shared/lib/deviceId'

const DAILY_GOAL = 200

function precisionSubtitle(precision: number) {
  if (precision === 100) return '¡Perfecto! Dominaste esta actividad.'
  if (precision >= 80) return '¡Muy bien! Estás muy cerca de dominarla.'
  if (precision >= 60) return '¡Buen trabajo! Sigue practicando.'
  return '¡Lo lograste! Cada intento te ayuda a avanzar.'
}

function saveSession(data: {
  module: string
  gameId: string
  exercises: number
  xpEarned: number
  precision: number
  userId: string
}) {
  const deviceId = getDeviceId()
  const sessionId = getSessionId()
  const learningModule =
    data.module === 'matematicas'
      ? 'math'
      : data.module === 'educacionAmbiental'
        ? 'eco'
        : data.module === 'tareas'
          ? 'tarea'
          : 'ai'

  void Promise.all([
    supabase.from('lesson_sessions').insert({
      user_id: data.userId,
      device_id: deviceId,
      modulo: data.module,
      game_id: data.gameId,
      ejercicios: data.exercises,
      xp_ganado: data.xpEarned,
      coins_ganados: data.xpEarned,
      precision: data.precision,
    }),
    supabase.from('learning_events').insert({
      user_id: data.userId,
      device_id: deviceId,
      session_id: sessionId,
      modulo: learningModule,
      tipo_ejercicio: 'interactivo',
      hora_uso: new Date().getHours(),
      accuracy: data.precision,
      attempts: data.exercises,
      errores_seguidos: 0,
      nivel: Math.max(1, Math.round(data.precision / 20)),
      tiempo_sesion: null,
      velocidad_respuesta: null,
      completado: true,
      abandono: false,
      topic: data.gameId,
      subject: data.module,
      task_id: null,
    }),
  ]).then((results) => {
    results.forEach(({ error }) => {
      if (error) console.error('[Lumi] session history insert error:', error.message)
    })
  })
}

export function LessonComplete() {
  const { lessonCompleteVisible, lastLessonData, closeLessonComplete, profile } =
    useGamification()
  const { session } = useAuth()
  const savedRef = useRef<string | null>(null)

  useEffect(() => {
    const key = lastLessonData
      ? `${lastLessonData.modulo}:${lastLessonData.gameId}:${lastLessonData.ejercicios}:${lastLessonData.precision}`
      : null

    if (
      lessonCompleteVisible &&
      lastLessonData &&
      session?.user.id &&
      savedRef.current !== key
    ) {
      savedRef.current = key
      saveSession({
        module: lastLessonData.modulo,
        gameId: lastLessonData.gameId,
        exercises: lastLessonData.ejercicios,
        xpEarned: lastLessonData.coinsGanados,
        precision: lastLessonData.precision,
        userId: session.user.id,
      })
    }
    if (!lessonCompleteVisible) savedRef.current = null
  }, [lessonCompleteVisible, lastLessonData, session?.user.id])

  const exercises = lastLessonData?.ejercicios ?? 0
  const coins = lastLessonData?.coinsGanados ?? 0
  const precision = lastLessonData?.precision ?? 0
  const xpToday = profile.xpHoy ?? 0
  const progress = Math.min(100, Math.round((xpToday / DAILY_GOAL) * 100))

  return (
    <AnimatePresence>
      {lessonCompleteVisible && (
        <motion.div
          key="lesson-complete-overlay"
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
            <motion.img
              src="/img/lumi/feliz.png"
              alt="Lumi feliz"
              className="h-24 w-24 object-contain"
              animate={{ y: [0, -10, 0, -6, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-white">
                ¡Lección completada!
              </h2>
              <p className="mt-1 text-sm text-gray-300">
                {precisionSubtitle(precision)}
              </p>
            </div>

            <div className="grid w-full grid-cols-3 gap-2">
              <MetricCard
                icon={IconClipboardCheck}
                value={String(exercises)}
                label="Ejercicios"
              />
              <MetricCard icon={IconBolt} value={`+${coins}`} label="LumiCoins" highlight />
              <MetricCard
                icon={IconTargetArrow}
                value={`${precision}%`}
                label="Precisión"
              />
            </div>

            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span className="font-semibold text-white">Objetivo diario</span>
                <span>
                  {xpToday} / {DAILY_GOAL} LumiCoins
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-800">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={closeLessonComplete}
              className="w-full rounded-2xl bg-violet-600 py-3 text-base font-bold text-white shadow-lg transition hover:bg-violet-500 active:scale-95"
            >
              Continuar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function MetricCard({
  icon: Icon,
  value,
  label,
  highlight = false,
}: {
  icon: ComponentType<{ size?: number; className?: string }>
  value: string
  label: string
  highlight?: boolean
}) {
  return (
    <div
      className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-3 ${
        highlight ? 'border border-yellow-500/40 bg-yellow-500/20' : 'bg-gray-800'
      }`}
    >
      <Icon size={21} className={highlight ? 'text-yellow-400' : 'text-cyan-300'} />
      <span
        className={`text-lg font-extrabold ${
          highlight ? 'text-yellow-400' : 'text-white'
        }`}
      >
        {value}
      </span>
      <span className="text-center text-[10px] leading-tight text-gray-400">{label}</span>
    </div>
  )
}
