// Llamadas al tutor de Lumi Pro (Edge Function tutor-pro).
import { supabase } from '@/shared/lib/supabaseClient'

export interface ProChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface TutorLessonContext {
  area: string
  lessonTitle: string
  lessonGoal: string
}

async function callTutor(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke<{ reply?: string; error?: string }>(
    'tutor-pro',
    { body }
  )
  if (error) {
    // Intentamos leer el mensaje que devuelve la función (401, 403, 500).
    const context = (error as { context?: Response }).context
    if (context && typeof context.json === 'function') {
      try {
        const payload = (await context.json()) as { error?: string }
        if (payload?.error) throw new Error(payload.error)
      } catch (inner) {
        if (inner instanceof Error && inner.message) throw inner
      }
    }
    throw new Error('El tutor no está disponible en este momento.')
  }
  if (data?.error) throw new Error(data.error)
  return data?.reply ?? ''
}

export function askPracticeFeedback(
  context: TutorLessonContext & { instruction: string; criteria: string[]; practiceText: string }
) {
  return callTutor({
    mode: 'practice_feedback',
    area: context.area,
    lesson_title: context.lessonTitle,
    lesson_goal: context.lessonGoal,
    instruction: context.instruction,
    criteria: context.criteria,
    practice_text: context.practiceText,
  })
}

export function askTutor(
  context: TutorLessonContext & { message: string; history: ProChatMessage[] }
) {
  return callTutor({
    mode: 'chat',
    area: context.area,
    lesson_title: context.lessonTitle,
    lesson_goal: context.lessonGoal,
    message: context.message,
    history: context.history,
  })
}
