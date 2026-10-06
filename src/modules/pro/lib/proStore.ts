// Acceso a datos de Lumi Pro (Supabase) y lógica del repaso espaciado.
import { supabase } from '@/shared/lib/supabaseClient'
import type { Tables } from '@/shared/lib/database.types'

export type ProSettings = Tables<'pro_settings'>
export type ProLessonProgress = Tables<'pro_lesson_progress'>
export type ProReview = Tables<'pro_reviews'>

// Días hasta el próximo repaso según la "caja" de la pregunta.
// Caja 0 → 1 día, 1 → 3 días, 2 → 7 días, 3 → 21 días, 4 → dominada (60 días).
export const REVIEW_INTERVALS = [1, 3, 7, 21, 60] as const
export const MASTERED_BOX = 4

/** Fecha local (zona horaria del dispositivo) en formato YYYY-MM-DD. */
export function localDate(offsetDays = 0) {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export async function loadSettings(userId: string) {
  const { data, error } = await supabase
    .from('pro_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function saveSettings(userId: string, area: string, planCuando: string) {
  const { error } = await supabase.from('pro_settings').upsert({
    user_id: userId,
    area,
    plan_cuando: planCuando || null,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}

export async function loadProgress(userId: string) {
  const { data, error } = await supabase
    .from('pro_lesson_progress')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  return data ?? []
}

export async function loadReviews(userId: string) {
  const { data, error } = await supabase
    .from('pro_reviews')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  return data ?? []
}

export function dueReviews(reviews: ProReview[]) {
  const today = localDate()
  return reviews.filter((review) => review.box < MASTERED_BOX && review.due_on <= today)
}

/**
 * Guarda una lección terminada. Todas sus preguntas entran al repaso
 * espaciado y vuelven al día siguiente, sin importar si se acertaron:
 * recuperar de memoria un día después es lo que fija el aprendizaje.
 */
export async function completeLesson(params: {
  userId: string
  lessonId: string
  practiceText: string
  answers: Array<{ questionId: string; correct: boolean }>
}) {
  const { userId, lessonId, practiceText, answers } = params
  const { error: progressError } = await supabase.from('pro_lesson_progress').upsert({
    user_id: userId,
    lesson_id: lessonId,
    practice_text: practiceText || null,
    completed_at: new Date().toISOString(),
  })
  if (progressError) throw progressError

  const tomorrow = localDate(1)
  const rows = answers.map((answer) => ({
    user_id: userId,
    question_id: answer.questionId,
    lesson_id: lessonId,
    box: 0,
    due_on: tomorrow,
    correct_count: answer.correct ? 1 : 0,
    wrong_count: answer.correct ? 0 : 1,
    last_answered_at: new Date().toISOString(),
  }))
  if (rows.length) {
    // ignoreDuplicates: si la persona repite la lección, no reiniciamos
    // el avance de repaso que ya tenía.
    const { error } = await supabase
      .from('pro_reviews')
      .upsert(rows, { onConflict: 'user_id,question_id', ignoreDuplicates: true })
    if (error) throw error
  }
}

/** Registra una respuesta de repaso y programa la próxima fecha. */
export async function answerReview(review: ProReview, correct: boolean) {
  const nextBox = correct ? Math.min(review.box + 1, MASTERED_BOX) : 0
  const interval = REVIEW_INTERVALS[nextBox] ?? 1
  const { error } = await supabase
    .from('pro_reviews')
    .update({
      box: nextBox,
      due_on: localDate(interval),
      correct_count: review.correct_count + (correct ? 1 : 0),
      wrong_count: review.wrong_count + (correct ? 0 : 1),
      last_answered_at: new Date().toISOString(),
    })
    .eq('user_id', review.user_id)
    .eq('question_id', review.question_id)
  if (error) throw error
  return { nextBox, interval }
}

export async function reportMiniTask(params: {
  userId: string
  lessonId: string
  minutesSaved: number
  note: string
}) {
  const { error } = await supabase
    .from('pro_lesson_progress')
    .update({
      minutes_saved: Math.max(0, Math.min(600, Math.round(params.minutesSaved))),
      mini_task_reported: params.note || 'Aplicada',
    })
    .eq('user_id', params.userId)
    .eq('lesson_id', params.lessonId)
  if (error) throw error
}

export async function recordActivity(userId: string, minutes: number) {
  const day = localDate()
  const { data } = await supabase
    .from('pro_activity_days')
    .select('minutes')
    .eq('user_id', userId)
    .eq('day', day)
    .maybeSingle()
  const { error } = await supabase.from('pro_activity_days').upsert({
    user_id: userId,
    day,
    minutes: (data?.minutes ?? 0) + Math.max(0, Math.round(minutes)),
  })
  if (error) throw error
}

export async function loadActivityDays(userId: string) {
  const { data, error } = await supabase
    .from('pro_activity_days')
    .select('day')
    .eq('user_id', userId)
    .gte('day', localDate(-90))
  if (error) throw error
  return (data ?? []).map((row) => row.day)
}

/**
 * Racha que perdona un día perdido: un día sin estudiar no la corta,
 * dos días seguidos sin estudiar sí (Lally et al., 2010: saltarse una
 * oportunidad no afecta la formación del hábito).
 */
export function forgivingStreak(days: string[]) {
  const active = new Set(days)
  let streak = 0
  let missedInARow = 0
  // Si hoy aún no estudia, la racha se cuenta desde ayer.
  let offset = active.has(localDate()) ? 0 : -1
  for (let i = 0; i < 90; i += 1) {
    if (active.has(localDate(offset))) {
      streak += 1
      missedInARow = 0
    } else {
      missedInARow += 1
      if (missedInARow >= 2) break
    }
    offset -= 1
  }
  return streak
}
