import { useState, useEffect } from 'react'
import { supabase } from '@/shared/lib/supabaseClient'
import { getDeviceId, getSessionId } from '@/shared/lib/deviceId'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

export type TutorTriggerType = 'solicitud_niño' | 'error_seguido'

export interface TutorMessage {
  id: string
  role: 'user' | 'tutor'
  text: string
}

export interface TutorContext {
  topic: string
  level?: number
  mistakes?: number
  attempts?: number
}

async function fetchTutorReply(
  message: string,
  triggerType: TutorTriggerType,
  context: TutorContext
): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (session) headers['Authorization'] = `Bearer ${session.access_token}`

  const res = await fetch(`${SUPABASE_URL}/functions/v1/tutor-ai`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message,
      trigger_type: triggerType,
      session_id: getSessionId(),
      device_id: getDeviceId(),
      topic: context.topic,
      level: context.level,
      mistakes: context.mistakes,
      attempts: context.attempts,
    }),
  })

  if (!res.ok) throw new Error(`HTTP_${res.status}`)
  const data = await res.json()
  return data.reply as string
}

export function useTutorIA(context: TutorContext) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<TutorMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  const addMsg = (role: 'user' | 'tutor', text: string) => {
    setMessages(prev => [...prev, { id: `${role}-${Date.now()}`, role, text }])
  }

  const callTutor = async (text: string, triggerType: TutorTriggerType) => {
    setIsLoading(true)
    try {
      const reply = await fetchTutorReply(text, triggerType, context)
      addMsg('tutor', reply)
    } catch {
      addMsg('tutor', '¡Ups! Algo salió mal. Intenta de nuevo. 🔧')
    } finally {
      setIsLoading(false)
    }
  }

  const openFromButton = () => {
    setIsOpen(true)
    if (messages.length === 0) {
      addMsg('tutor', `¡Hola! 💡 Estoy aquí para ayudarte con ${context.topic}. ¿Qué quieres que te explique?`)
    }
  }

  const openFromError = async () => {
    setIsOpen(true)
    if (messages.length === 0) {
      const userText = `Necesito ayuda con ${context.topic}`
      setMessages([{ id: `user-${Date.now()}`, role: 'user', text: userText }])
      await callTutor(userText, 'error_seguido')
    }
  }

  const close = () => setIsOpen(false)

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading || offline) return
    addMsg('user', text)
    await callTutor(text, 'solicitud_niño')
  }

  return { isOpen, messages, isLoading, offline, openFromButton, openFromError, close, sendMessage }
}
