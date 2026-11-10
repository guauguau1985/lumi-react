import { useRef, useEffect } from 'react'
import {
  useAdaptiveLearning,
  type AdaptiveLearningRuleConfig,
} from '@/adaptiveLearning/hook/useAdaptiveLearning'
import { supabase } from '@/shared/lib/supabaseClient'
import { getActiveChildId, getDeviceId, getSessionId } from '@/shared/lib/deviceId'
import type { TablesInsert } from '@/shared/lib/database.types'
import { useAuth } from '@/features/auth/AuthContext'

type Modulo =
  | 'math'
  | 'eco'
  | 'naturales'
  | 'coder'
  | 'ai'
  | 'tarea'
  | 'lenguaje'
  | 'ingles'
  | 'historia'
  | 'tecnologia'
type TipoEjercicio = 'visual' | 'texto' | 'interactivo'

interface UseLearningTrackerOptions {
  modulo: Modulo
  tipoEjercicio?: TipoEjercicio
  initialLevel?: number
  customRules?: Partial<AdaptiveLearningRuleConfig>
  /** Asignatura escolar, ej. 'matematicas', 'ciencias_naturales' (si el juego la conoce) */
  subject?: string
  /** Tema concreto del ejercicio, ej. 'divisiones', 'fracciones' */
  topic?: string
  /** Id de la tarea escolar asociada (flujo de tareas), si existe */
  taskId?: string
}

/**
 * Inserta el evento (fire-and-forget). El user_id viene de la sesión de Supabase Auth
 * (cuenta del niño); child_id solo se agrega si hay un perfil de niño activo válido,
 * para no enviar la columna cuando la migración de historial aún no está aplicada.
 */
function insertEvent(event: TablesInsert<'learning_events'>) {
  const childId = getActiveChildId()
  void (async () => {
    const { error } = await supabase
      .from('learning_events')
      .insert(childId ? { ...event, child_id: childId } : event)
    if (error) console.error('[Lumi] learning_event insert error:', error.message)
  })().catch((err: unknown) => {
    console.error('[Lumi] learning_event insert error:', err)
  })
}

/**
 * Wraps useAdaptiveLearning adding fire-and-forget event tracking to Supabase.
 * One event is inserted per session (on trackComplete or on unmount as abandono).
 * velocidadRespuesta = ms from component render to first answer attempt.
 */
export function useLearningTracker({
  modulo,
  tipoEjercicio,
  initialLevel = 1,
  customRules,
  subject,
  topic,
  taskId,
}: UseLearningTrackerOptions) {
  const { session } = useAuth()
  const { state, rules, recordAnswer, resetAdaptiveLearning } =
    useAdaptiveLearning(initialLevel, customRules)

  const renderTimeRef = useRef(Date.now())
  const startTimeRef = useRef(Date.now())
  const firstAnswerMsRef = useRef<number | null>(null)
  const completadoRef = useRef(false)
  const userIdRef = useRef(session?.user.id ?? null)
  userIdRef.current = session?.user.id ?? null

  // Always reflects the latest state (updated during render, safe for use in effects)
  const stateRef = useRef(state)
  stateRef.current = state

  // Insert abandono on unmount if the session was never completed
  useEffect(() => {
    return () => {
      if (!completadoRef.current && stateRef.current.totalAnswers > 0) {
        if (!userIdRef.current) return
        insertEvent({
          user_id: userIdRef.current,
          device_id: getDeviceId(),
          session_id: getSessionId(),
          modulo,
          tipo_ejercicio: tipoEjercicio ?? null,
          subject: subject ?? null,
          topic: topic ?? null,
          task_id: taskId ?? null,
          hora_uso: new Date().getHours(),
          accuracy: stateRef.current.accuracy,
          attempts: stateRef.current.totalAnswers,
          errores_seguidos: stateRef.current.errorStreak,
          nivel: stateRef.current.currentLevel,
          velocidad_respuesta: firstAnswerMsRef.current,
          tiempo_sesion: Math.round((Date.now() - startTimeRef.current) / 1000),
          completado: false,
          abandono: true,
        })
      }
    }
    // Intentional empty deps: captures modulo/tipoEjercicio/subject/topic/taskId at mount (stable values),
    // reads live data via refs to avoid stale closures.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Record an answer attempt. Tracks velocity to first answer automatically. */
  const trackAnswer = (isCorrect: boolean) => {
    if (firstAnswerMsRef.current === null) {
      firstAnswerMsRef.current = Date.now() - renderTimeRef.current
    }
    recordAnswer(isCorrect)
  }

  /**
   * Call when the exercise is fully completed.
   * Inserts a learning_event with completado: true.
   * @param finalAccuracy Optional override (0–100). Defaults to state.accuracy.
   */
  const trackComplete = (finalAccuracy?: number) => {
    completadoRef.current = true
    if (!userIdRef.current) return
    insertEvent({
      user_id: userIdRef.current,
      device_id: getDeviceId(),
      session_id: getSessionId(),
      modulo,
      tipo_ejercicio: tipoEjercicio ?? null,
      subject: subject ?? null,
      topic: topic ?? null,
      task_id: taskId ?? null,
      hora_uso: new Date().getHours(),
      accuracy: finalAccuracy ?? stateRef.current.accuracy,
      attempts: stateRef.current.totalAnswers,
      errores_seguidos: stateRef.current.errorStreak,
      nivel: stateRef.current.currentLevel,
      velocidad_respuesta: firstAnswerMsRef.current,
      tiempo_sesion: Math.round((Date.now() - startTimeRef.current) / 1000),
      completado: true,
      abandono: false,
    })
  }

  /**
   * Reset tracking refs for a new round/session within the same component lifecycle.
   * Does NOT reset adaptive learning state unless a new level is provided.
   */
  const resetTracker = (newLevel?: number) => {
    renderTimeRef.current = Date.now()
    startTimeRef.current = Date.now()
    firstAnswerMsRef.current = null
    completadoRef.current = false
    if (newLevel !== undefined) resetAdaptiveLearning(newLevel)
  }

  return {
    state,
    rules,
    trackAnswer,
    trackComplete,
    resetTracker,
    resetAdaptiveLearning,
  }
}
