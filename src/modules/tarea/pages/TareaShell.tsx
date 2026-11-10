import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  IconArrowRight,
  IconBook2,
  IconCheck,
  IconChevronDown,
  IconCircleCheck,
  IconClipboardCheck,
  IconFile,
  IconFileText,
  IconHelpCircle,
  IconHistory,
  IconHome,
  IconBulb,
  IconPlayerPlay,
  IconPointFilled,
  IconRosetteDiscountCheck,
  IconSchool,
  IconSend2,
  IconSparkles,
  IconStar,
  IconTrophy,
  IconUpload,
  IconWand,
  IconX,
} from '@tabler/icons-react'
import { useAuth } from '@/features/auth/AuthContext'
import { useGameRewards } from '@/gamification/useGameRewards'
import { SpeakButton } from '@/shared/components/voice/SpeakButton'
import { VoiceInputButton } from '@/shared/components/voice/VoiceInputButton'
import { supabase } from '@/shared/lib/supabaseClient'
import { getDeviceId, getSessionId } from '@/shared/lib/deviceId'
import type { Json, Tables } from '@/shared/lib/database.types'
import { avatarSrc } from '@/shared/data/avatars'
import { extractHomeworkFile } from '@/modules/tarea/lib/extractHomeworkFile'
import {
  curriculumContext,
  GRADES,
  SUBJECTS,
  type HomeworkSubject,
} from '@/modules/tarea/data/curriculumContext'

type HomeworkTask = Tables<'homework_tasks'>
type HomeworkMessage = Tables<'homework_messages'>
type TutorTool = 'explain' | 'guide' | 'hint' | 'review' | 'question' | 'start' | 'final'
type Grade = HomeworkTask['grade']

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tutor-ai`
const MAX_ATTACHMENTS = 6

const OPTIONAL_SUBJECTS = [
  { value: 'otra', label: 'No sé' },
  ...SUBJECTS.filter((item) => item.value !== 'otra'),
] as Array<{ value: HomeworkSubject; label: string }>

const TOOLS: Array<{
  id: TutorTool
  title: string
  description: string
  icon: typeof IconSparkles
}> = [
  {
    id: 'explain',
    title: 'Explicar el tema',
    description: 'Lumi te explica paso a paso',
    icon: IconSparkles,
  },
  {
    id: 'guide',
    title: 'Guía paso a paso',
    description: 'Te acompaña en cada parte',
    icon: IconPlayerPlay,
  },
  {
    id: 'hint',
    title: 'Dame una pista',
    description: 'Una ayudita corta, sin darte la respuesta',
    icon: IconBulb,
  },
  {
    id: 'review',
    title: 'Revisar mi trabajo',
    description: 'Escribe tu avance en el chat y presiona aquí',
    icon: IconClipboardCheck,
  },
  {
    id: 'question',
    title: 'Preguntarme algo',
    description: 'Lumi aclara una duda',
    icon: IconHelpCircle,
  },
]

// Límites de pantalla: aunque la Edge Function desplegada sea antigua y mande
// resúmenes largos o muchos pasos, el niño ve siempre algo corto.
const MAX_SUMMARY_SENTENCES = 2
const MAX_PLAN_STEPS = 4
const MAX_FINAL_SENTENCES = 3

// Inicio rápido: curso, materia y tema se recuerdan desde la vez anterior.
const QUICK_START_KEY = 'lumi_tarea_inicio'
type QuickStart = { grade?: Grade; subject?: HomeworkSubject; topic?: string }

function readQuickStart(): QuickStart {
  try {
    const raw = JSON.parse(localStorage.getItem(QUICK_START_KEY) ?? '{}') as QuickStart
    return {
      grade: GRADES.some((item) => item.value === raw.grade) ? raw.grade : undefined,
      subject: SUBJECTS.some((item) => item.value === raw.subject) ? raw.subject : undefined,
      topic: typeof raw.topic === 'string' ? raw.topic.slice(0, 80) : undefined,
    }
  } catch {
    return {}
  }
}

function saveQuickStart(value: QuickStart) {
  try {
    localStorage.setItem(QUICK_START_KEY, JSON.stringify(value))
  } catch {
    // Sin almacenamiento disponible: simplemente no se recuerda.
  }
}

// Instrucciones internas para Lumi que viajan dentro del mensaje del niño.
// Funcionan con cualquier versión de tutor-ai y en pantalla solo se ve la
// parte anterior a la marca.
const LUMI_NOTE = '[Para Lumi]'

function withNote(visible: string, note: string) {
  return `${visible}\n\n${LUMI_NOTE} ${note}`
}

function visibleContent(content: string) {
  const index = content.indexOf(LUMI_NOTE)
  return (index >= 0 ? content.slice(0, index) : content).replace(/\*\*/g, '').trim()
}

function firstSentences(text: string, max: number) {
  const clean = text.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim()
  const parts = clean.match(/[^.!?…]+[.!?…]+["»”)]*|[^.!?…]+$/g) ?? [clean]
  return parts
    .slice(0, max)
    .map((part) => part.trim())
    .join(' ')
}

function checklistFrom(value: Json): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .slice(0, MAX_PLAN_STEPS)
}

function displayTime(value: string) {
  return new Date(value).toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function safeFileName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .slice(0, 90)
}

async function callTutor(
  body: Record<string, unknown>
): Promise<{
  reply: string
  title?: string
  summary?: string
  checklist?: string[]
  messages?: HomeworkMessage[]
}> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) throw new Error('Tu sesión terminó. Vuelve a ingresar.')

  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(
      typeof payload.error === 'string'
        ? payload.error
        : 'Lumi no pudo responder en este momento.'
    )
  }
  return payload
}

export default function TareaShell() {
  const [searchParams] = useSearchParams()
  const { session, profile } = useAuth()
  const rewards = useGameRewards('tareas', 'tutor-tareas')
  const userId = session?.user.id
  const remembered = useMemo(readQuickStart, [])
  const [subject, setSubject] = useState<HomeworkSubject>(() => {
    const requested = searchParams.get('subject')
    return SUBJECTS.some((item) => item.value === requested)
      ? (requested as HomeworkSubject)
      : remembered.subject ?? 'otra'
  })
  const [grade, setGrade] = useState<Grade>(
    remembered.grade ?? profile?.grade ?? '5-basico'
  )
  const [topic, setTopic] = useState(remembered.topic ?? '')
  const [showPlan, setShowPlan] = useState(false)
  const [finalSummary, setFinalSummary] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [pastedText, setPastedText] = useState('')
  const [task, setTask] = useState<HomeworkTask | null>(null)
  const [recentTasks, setRecentTasks] = useState<HomeworkTask[]>([])
  const [messages, setMessages] = useState<HomeworkMessage[]>([])
  const [input, setInput] = useState('')
  // Mensaje del niño que se está enviando: se muestra al tiro en el chat para
  // que no parezca que "se borró" mientras Lumi responde.
  const [pendingMessage, setPendingMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [offline, setOffline] = useState(!navigator.onLine)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const chatListRef = useRef<HTMLDivElement>(null)

  const avatar = avatarSrc(profile?.avatar_key)
  const gradeLabel = GRADES.find((item) => item.value === grade)?.label ?? grade
  const selectedSubject =
    subject === 'otra'
      ? 'Materia por identificar'
      : SUBJECTS.find((item) => item.value === subject)?.label ?? 'Materia'
  const checklist = useMemo(() => checklistFrom(task?.checklist ?? []), [task?.checklist])
  const currentStage = task?.current_stage ?? 1
  const shortSummary = task?.instructions_summary
    ? firstSentences(task.instructions_summary, MAX_SUMMARY_SENTENCES)
    : ''

  // Si no hay curso recordado, usamos el del perfil apenas carga.
  useEffect(() => {
    if (!remembered.grade && profile?.grade) setGrade(profile.grade)
  }, [profile?.grade, remembered.grade])

  useEffect(() => {
    const handleOnline = () => setOffline(false)
    const handleOffline = () => setOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (!userId) return
    let active = true
    void (async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession()
      if (!active || currentSession?.user.id !== userId) return
      const { data, error: loadError } = await supabase
        .from('homework_tasks')
        .select('*')
        .eq('child_id', userId)
        .order('created_at', { ascending: false })
        .limit(8)
      if (!active) return
        if (loadError) {
          console.error('[Lumi] No se pudo cargar el historial:', loadError.message)
          setError(`No pudimos cargar tus tareas guardadas: ${loadError.message}`)
          return
        }
        if ((data ?? []).length > 0) {
          setRecentTasks(data ?? [])
          return
        }

        // A restored account can briefly have an auth session before PostgREST
        // refreshes its RLS claims. The profile endpoint validates the same user
        // server-side and provides a reliable history fallback.
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/compute-profile`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${currentSession.access_token}`,
            },
            body: JSON.stringify({ child_id: userId }),
          }
        )
        const payload = await response.json().catch(() => ({}))
        if (
          active &&
          response.ok &&
          Array.isArray(payload.recent_tasks)
        ) {
          setRecentTasks(payload.recent_tasks as HomeworkTask[])
        }
    })()
    return () => {
      active = false
    }
  }, [userId])

  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTo({
        top: chatListRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages, busy])

  const refreshMessages = async (taskId: string) => {
    const history = await callTutor({ mode: 'get_task_history', task_id: taskId })
    setMessages(history.messages ?? [])
  }

  const loadTask = async (selected: HomeworkTask) => {
    setTask(selected)
    setSubject(selected.subject)
    setGrade(selected.grade)
    setShowHistory(false)
    setShowPlan(false)
    setFinalSummary('')
    setError('')
    await refreshMessages(selected.id)
  }

  const startTask = async () => {
    if (!userId || busy || offline) return
    const cleanTopic = topic.trim()
    if (!pastedText.trim() && !cleanTopic && files.length === 0) {
      setError('Escribe el tema, cuéntale a Lumi qué necesitas o adjunta un documento.')
      return
    }

    setBusy(true)
    setError('')
    setUploadProgress(files.length > 0 ? 1 : 100)
    saveQuickStart({ grade, subject, topic: cleanTopic })

    try {
      const extractedParts: string[] = []
      let pageCount = 0
      for (let index = 0; index < files.length; index += 1) {
        const currentFile = files[index]
        const extracted = await extractHomeworkFile(currentFile, (progress) => {
          setUploadProgress(Math.round(((index + progress / 100) / files.length) * 100))
        })
        extractedParts.push(
          files.length > 1 ? `[Documento: ${currentFile.name}]\n${extracted.text}` : extracted.text
        )
        pageCount += extracted.pageCount ?? 0
      }
      const extractedText = [
        cleanTopic ? `Tema indicado por el estudiante: ${cleanTopic}` : '',
        pastedText.trim(),
        ...extractedParts,
      ]
        .filter(Boolean)
        .join('\n\n')
      if (extractedText.length < 8) {
        throw new Error(
          'No encontramos texto legible. Cuéntale a Lumi con más detalle qué necesitas, o prueba con otra imagen.'
        )
      }

      const firstFile = files[0]
      const initialTitle = cleanTopic
        ? cleanTopic.slice(0, 90)
        : pastedText.trim()
        ? pastedText.trim().slice(0, 90)
        : firstFile
          ? firstFile.name.replace(/\.[^.]+$/, '').slice(0, 90)
          : `${selectedSubject} — nueva tarea`
      const { data: created, error: insertError } = await supabase
        .from('homework_tasks')
        .insert({
          child_id: userId,
          title: initialTitle,
          subject,
          grade,
          extracted_text: extractedText,
          file_name: firstFile?.name ?? null,
          file_type: firstFile?.type ?? null,
          current_stage: 2,
        })
        .select('*')
        .single()
      if (insertError) throw insertError

      let nextTask = created
      if (files.length > 0) {
        const uploaded: Array<{ name: string; path: string; type: string }> = []
        for (let index = 0; index < files.length; index += 1) {
          const currentFile = files[index]
          const path = `${userId}/${created.id}/${Date.now()}-${index}-${safeFileName(currentFile.name)}`
          const { error: storageError } = await supabase.storage
            .from('homework-files')
            .upload(path, currentFile, { contentType: currentFile.type || undefined })
          if (storageError) throw storageError
          uploaded.push({ name: currentFile.name, path, type: currentFile.type || '' })
        }
        const { data: updated, error: updateError } = await supabase
          .from('homework_tasks')
          .update({ file_path: uploaded[0]?.path ?? null, attachments: uploaded })
          .eq('id', created.id)
          .select('*')
          .single()
        if (updateError) throw updateError
        nextTask = updated
      }

      const analysis = await callTutor({
        mode: 'analyze_task',
        task_id: created.id,
        subject,
        grade,
        task_context: extractedText,
        curriculum_context: curriculumContext(subject, grade, extractedText),
        page_count: pageCount,
      })
      const { data: analyzed, error: analysisUpdateError } = await supabase
        .from('homework_tasks')
        .update({
          title: analysis.title?.slice(0, 120) || nextTask.title,
          instructions_summary: firstSentences(
            analysis.summary || analysis.reply || '',
            MAX_SUMMARY_SENTENCES
          ),
          checklist: (analysis.checklist ?? []).slice(0, MAX_PLAN_STEPS),
          current_stage: 2,
        })
        .eq('id', created.id)
        .select('*')
        .single()
      if (analysisUpdateError) throw analysisUpdateError

      setTask(analyzed)
      setShowPlan(false)
      setFinalSummary('')
      setRecentTasks((items) => [analyzed, ...items.filter((item) => item.id !== analyzed.id)])
      rewards.onLevelCompleted({ stage: 'understand', taskId: analyzed.id })

      // Partimos de inmediato: Lumi propone el primer ejercicio sin preguntar.
      try {
        await askTutor(
          analyzed,
          'start',
          withNote(
            cleanTopic ? `¡Empecemos con ${cleanTopic}!` : '¡Empecemos!',
            `Propón ahora mismo el PRIMER ejercicio concreto y corto de esta tarea, adecuado a ${
              GRADES.find((item) => item.value === analyzed.grade)?.label ?? analyzed.grade
            }. No me pidas permiso ni me preguntes si prefiero que expliques el tema o que empecemos. Como máximo una frase de contexto y luego el ejercicio, terminando con la pregunta del ejercicio. Si después respondo mal, dame una pista corta, no la respuesta.`
          )
        )
      } catch (caught) {
        await refreshMessages(analyzed.id).catch(() => undefined)
        setError(
          caught instanceof Error
            ? caught.message
            : 'Lumi no alcanzó a proponer el primer ejercicio. Escríbele para comenzar.'
        )
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No pudimos preparar tu tarea.')
    } finally {
      setBusy(false)
    }
  }

  // Llamada base al chat de la tarea (modo homework_chat o review_work).
  // No revisa busy: quien la llama se encarga.
  const askTutor = async (
    currentTask: HomeworkTask,
    tool: TutorTool,
    message: string,
    refresh = true
  ) => {
    const result = await callTutor({
      mode: tool === 'review' ? 'review_work' : 'homework_chat',
      tool,
      task_id: currentTask.id,
      message,
      student_work: tool === 'review' ? message : undefined,
      subject: currentTask.subject,
      grade: currentTask.grade,
      task_context: currentTask.extracted_text,
      curriculum_context: curriculumContext(
        currentTask.subject,
        currentTask.grade,
        [visibleContent(message), currentTask.extracted_text].filter(Boolean).join('\n')
      ),
    })
    if (tool === 'review') {
      rewards.onCorrect({ taskId: currentTask.id, action: 'review' })
    }
    const nextStage = tool === 'review' ? 4 : Math.max(currentTask.current_stage, 3)
    if (nextStage !== currentTask.current_stage) {
      const { data: updated } = await supabase
        .from('homework_tasks')
        .update({ current_stage: nextStage })
        .eq('id', currentTask.id)
        .select('*')
        .single()
      if (updated) setTask(updated)
    }
    if (refresh) await refreshMessages(currentTask.id)
    return result.reply ?? ''
  }

  const sendTutorMessage = async (tool: TutorTool = 'question') => {
    if (!task || !userId || busy || offline) return
    const usesChatInput = tool === 'question' || tool === 'review'
    const message = usesChatInput
      ? input.trim()
      : tool === 'hint'
        ? withNote(
            'Dame una pista',
            'Dame UNA pista corta (1 o 2 frases) para el paso o ejercicio en el que vamos ahora. No me des la respuesta ni escribas la tarea por mí. Termina invitándome a intentarlo.'
          )
        : ''
    if (tool === 'question' && !message) return
    if (tool === 'review' && message.length < 15) {
      setError('Escribe o pega tu avance en el chat para que Lumi lo revise.')
      return
    }

    setBusy(true)
    setError('')
    if (usesChatInput) {
      setInput('')
      setPendingMessage(message)
    }
    try {
      await askTutor(task, tool, message)
    } catch (caught) {
      // Si Lumi no alcanzó a responder, devolvemos lo escrito a la caja de
      // texto para que el niño no tenga que escribirlo de nuevo.
      if (usesChatInput) setInput((current) => current || message)
      setError(caught instanceof Error ? caught.message : 'Lumi no pudo responder.')
    } finally {
      setPendingMessage('')
      setBusy(false)
    }
  }

  // Terminar: Lumi resume lo aprendido (máx. 3 frases) y la tarea se marca
  // como completada. El esquema actual de homework_messages no admite
  // message_kind final_summary, así que el resumen se muestra en una tarjeta.
  const finishTask = async () => {
    if (!task || !userId || task.status === 'completed' || busy) return
    setBusy(true)
    setError('')
    if (!offline) {
      try {
        const reply = await askTutor(
          task,
          'final',
          withNote(
            'Terminé',
            'Resume en máximo 3 frases cortas y simples lo que aprendí hoy con esta tarea. Sin listas y sin preguntas al final.'
          ),
          false
        )
        setFinalSummary(firstSentences(reply, MAX_FINAL_SENTENCES))
      } catch {
        // Si el resumen falla, igual dejamos terminar la tarea.
      }
    }
    try {
      const completedAt = new Date().toISOString()
      const { data: completed, error: updateError } = await supabase
        .from('homework_tasks')
        .update({
          status: 'completed',
          current_stage: 4,
          completed_at: completedAt,
          points_earned: 40,
        })
        .eq('id', task.id)
        .select('*')
        .single()
      if (updateError) throw updateError

      await supabase.from('learning_events').insert({
        user_id: userId,
        device_id: getDeviceId(),
        session_id: getSessionId(),
        modulo: 'tarea',
        tipo_ejercicio: 'texto',
        hora_uso: new Date().getHours(),
        accuracy: null,
        attempts: Math.max(messages.filter((item) => item.role === 'student').length, 1),
        errores_seguidos: 0,
        nivel: 1,
        velocidad_respuesta: null,
        tiempo_sesion: Math.max(
          60,
          Math.round((Date.now() - new Date(task.created_at).getTime()) / 1000)
        ),
        completado: true,
        abandono: false,
        topic: task.title,
        subject: task.subject,
        task_id: task.id,
      })
      setTask(completed)
      setRecentTasks((items) =>
        items.map((item) => (item.id === completed.id ? completed : item))
      )
      rewards.onGameCompleted({
        taskId: task.id,
        ejercicios: checklist.length || 1,
        accuracy: 100,
      })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No pudimos terminar la tarea.')
    } finally {
      setBusy(false)
    }
  }

  const resetTask = () => {
    setTask(null)
    setMessages([])
    setFiles([])
    setPastedText('')
    setShowPlan(false)
    setFinalSummary('')
    setUploadProgress(0)
    setError('')
  }

  const addFiles = (picked: File[]) => {
    if (picked.length === 0) return
    setFiles((prev) => {
      const merged = [...prev, ...picked]
      return merged.slice(0, MAX_ATTACHMENTS)
    })
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
  }

  return (
    <div className="min-h-[calc(100svh-56px)] bg-[#f8f7fc] text-slate-900">
      <div className="mx-auto flex min-h-[calc(100svh-56px)] max-w-[1500px]">
        <aside className="hidden w-64 shrink-0 border-r border-violet-100 bg-white px-5 py-6 lg:flex lg:flex-col">
          <Link to="/" className="flex items-center gap-3 px-2">
            <img src="/img/lumi/face.png" alt="Lumi" className="h-12 w-12 object-contain" />
            <span className="text-3xl font-black tracking-tight text-violet-700">Lumi</span>
          </Link>

          <div className="mt-7 text-center">
            <img
              src={avatar}
              alt="Tu avatar"
              className="mx-auto h-20 w-20 rounded-full border-4 border-violet-100 object-cover"
            />
            <p className="mt-3 font-black">¡Hola, {profile?.nombre ?? 'estudiante'}!</p>
            <p className="text-xs font-bold text-slate-500">{gradeLabel}</p>
          </div>

          <nav className="mt-7 space-y-1.5 text-sm font-bold">
            <SideLink to="/" icon={IconHome} label="Inicio" />
            <button
              onClick={() => setShowHistory(true)}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-slate-600 hover:bg-violet-50"
            >
              <IconHistory size={19} /> Mis tareas
            </button>
            <span className="flex items-center gap-3 rounded-2xl bg-violet-600 px-4 py-3 text-white shadow-lg shadow-violet-200">
              <IconWand size={19} /> Ayúdame con mi tarea
            </span>
            <SideLink to="/math" icon={IconBook2} label="Ejercicios" />
            <SideLink to="/liga" icon={IconTrophy} label="Premios" />
          </nav>

          <div className="mt-auto rounded-3xl bg-gradient-to-br from-violet-50 to-emerald-50 p-4 text-center">
            <p className="text-xs font-extrabold text-violet-800">
              Estoy aquí para ayudarte
            </p>
            <img
              src="/img/lumi/body.png"
              alt="Lumi"
              className="mx-auto mt-2 h-28 object-contain"
            />
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-3 py-4 sm:px-5 lg:px-7">
          <header className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-violet-100 bg-white px-4 py-4 shadow-sm sm:px-6">
            <div className="flex items-center gap-3">
              <img
                src="/img/lumi/face.png"
                alt="Lumi"
                className="h-11 w-11 rounded-2xl object-contain"
              />
              <div>
                <h1 className="text-lg font-black sm:text-2xl">Ayúdame con mi tarea</h1>
                <p className="text-xs font-semibold text-slate-500 sm:text-sm">
                  Cuéntale qué necesitas y Lumi te ayudará paso a paso
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-amber-50 px-3 py-2 text-sm font-black text-amber-700">
              <IconStar size={19} fill="currentColor" />
              {rewards.profile.xpTotal} puntos
            </div>
          </header>

          {offline && (
            <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
              Estás sin conexión. Tu historial sigue visible, pero Lumi responderá cuando
              vuelva internet.
            </div>
          )}

          {showHistory ? (
            <HistoryPanel
              tasks={recentTasks}
              onSelect={(selected) => void loadTask(selected)}
              onClose={() => setShowHistory(false)}
            />
          ) : (
            <>
              <section className="mt-3 rounded-3xl border border-violet-100 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-sm font-black text-violet-700">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-violet-100">
                      1
                    </span>
                    Cuéntale a Lumi
                  </h2>
                  {task && (
                    <button
                      type="button"
                      onClick={resetTask}
                      className="text-xs font-black text-violet-600"
                    >
                      Nueva tarea
                    </button>
                  )}
                </div>

                {!task ? (
                  <div className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
                    <div className="rounded-3xl border-2 border-dashed border-violet-200 bg-violet-50/40 p-4">
                      <label className="block text-sm font-black text-violet-700">
                        ¿Qué necesitas?
                      </label>
                      <textarea
                        value={pastedText}
                        onChange={(event) => setPastedText(event.target.value)}
                        placeholder="Cuéntale a Lumi qué necesitas. Por ejemplo: “Necesito ayuda con las fracciones de la guía” o pega aquí las instrucciones."
                        className="mt-2 min-h-28 w-full resize-y rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                      />

                      <div className="mt-4 border-t border-violet-100 pt-4">
                        <p className="text-xs font-black text-violet-700">
                          ¿Tienes una guía, rúbrica u otro documento?{' '}
                          <span className="font-semibold text-slate-400">(opcional)</span>
                        </p>
                        <label className="mt-2 flex min-h-20 cursor-pointer flex-col items-center justify-center rounded-2xl bg-white p-4 text-center shadow-sm">
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.txt,.jpg,.jpeg,.png,.webp,application/pdf,text/plain,image/*"
                            className="sr-only"
                            onChange={(event) => {
                              const picked = Array.from(event.target.files ?? [])
                              event.target.value = ''
                              addFiles(picked)
                            }}
                          />
                          <IconUpload size={26} className="text-violet-600" />
                          <span className="mt-1 text-xs font-black text-violet-700">
                            Adjuntar documentos
                          </span>
                          <span className="mt-1 text-[11px] text-slate-400">
                            PDF, TXT, JPG, PNG o WEBP · máx. 10 MB cada uno, hasta{' '}
                            {MAX_ATTACHMENTS}
                          </span>
                        </label>

                        {files.length > 0 && (
                          <ul className="mt-3 space-y-1.5">
                            {files.map((item, index) => (
                              <li
                                key={`${item.name}-${index}`}
                                className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold shadow-sm"
                              >
                                <IconFileText size={16} className="shrink-0 text-violet-500" />
                                <span className="min-w-0 flex-1 truncate">{item.name}</span>
                                <span className="shrink-0 text-slate-400">
                                  {(item.size / 1024 / 1024).toFixed(1)} MB
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  aria-label={`Quitar ${item.name}`}
                                  className="shrink-0 text-slate-400 hover:text-red-500"
                                >
                                  <IconX size={15} />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="order-first space-y-3 lg:order-none">
                      <ChipGroup
                        icon={IconSchool}
                        label="Curso"
                        value={grade}
                        onChange={(value) => setGrade(value as Grade)}
                        options={GRADES}
                      />
                      <ChipGroup
                        icon={IconBook2}
                        label="Materia"
                        value={subject}
                        onChange={(value) => setSubject(value as HomeworkSubject)}
                        options={OPTIONAL_SUBJECTS}
                      />
                      <label className="block">
                        <span className="mb-1.5 flex items-center gap-2 text-xs font-black text-slate-600">
                          <IconSparkles size={17} className="text-violet-600" /> Tema
                        </span>
                        <input
                          value={topic}
                          onChange={(event) => setTopic(event.target.value.slice(0, 80))}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault()
                              void startTask()
                            }
                          }}
                          placeholder="Ej: fracciones, el cuento, los volcanes"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-bold outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 sm:text-sm"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => void startTask()}
                        disabled={busy || offline}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busy ? `Preparando ${uploadProgress}%` : '¡Empezar!'}
                        {!busy && <IconArrowRight size={19} />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-violet-50 p-4">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-violet-600 shadow-sm">
                      <IconFile size={24} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black">{task.title}</p>
                      <p className="text-xs font-semibold text-slate-500">
                        {selectedSubject} · {gradeLabel}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                      <IconCheck size={15} />{' '}
                      {files.length > 0
                        ? `${files.length} documento${files.length > 1 ? 's' : ''} leído${files.length > 1 ? 's' : ''}`
                        : 'Listo'}
                    </span>
                  </div>
                )}
              </section>

              <StageTabs current={currentStage} />

              {task && (
                <div className="mt-3 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
                  <section className="min-w-0 rounded-3xl border border-violet-100 bg-white p-3 shadow-sm sm:p-5">
                    {shortSummary && (
                      <div className="flex gap-3">
                        <img
                          src="/img/lumi/face.png"
                          alt="Lumi"
                          className="h-11 w-11 shrink-0 rounded-2xl object-contain"
                        />
                        <div className="rounded-3xl rounded-tl-md bg-[#f6f3ff] p-4">
                          <p className="text-sm font-bold leading-6">
                            ¡Listo! Ya leí tu tarea. Esto es lo que debes hacer:
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            {shortSummary}
                          </p>
                          {checklist.length > 0 && showPlan && (
                            <ol
                              id="plan-tarea"
                              className="mt-3 space-y-1 rounded-2xl bg-white/70 p-3 text-sm text-slate-700"
                            >
                              {checklist.map((item, index) => (
                                <li key={`${item}-${index}`} className="flex gap-2">
                                  <span className="font-black text-violet-600">
                                    {index + 1}.
                                  </span>
                                  {item}
                                </li>
                              ))}
                            </ol>
                          )}
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <SpeakButton text={shortSummary} context="explanation" />
                            {checklist.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setShowPlan((value) => !value)}
                                aria-expanded={showPlan}
                                aria-controls="plan-tarea"
                                className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-black text-violet-700 shadow-sm hover:bg-violet-100"
                              >
                                {showPlan ? 'Ocultar el plan' : 'Ver el plan'}
                                <IconChevronDown
                                  size={15}
                                  className={`transition ${showPlan ? 'rotate-180' : ''}`}
                                />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div
                      ref={chatListRef}
                      className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1"
                    >
                      {messages
                        .filter((message) => message.message_kind !== 'summary')
                        .map((message) => {
                          const cleanContent = visibleContent(message.content)
                          // Lumi siempre debe poder leerse y escucharse a la vez. Si por algún
                          // problema (por ejemplo una respuesta vacía del modelo) no hay texto,
                          // mostramos un aviso en vez de dejar la burbuja en blanco con solo el
                          // botón de audio.
                          const displayContent =
                            cleanContent ||
                            (message.role === 'tutor'
                              ? 'Lumi no pudo escribir una respuesta esta vez. Vuelve a preguntar.'
                              : '')
                          return (
                            <div
                              key={message.id}
                              className={`flex gap-2 ${
                                message.role === 'student' ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              {message.role === 'tutor' && (
                                <img
                                  src="/img/lumi/face.png"
                                  alt=""
                                  className="h-8 w-8 shrink-0 rounded-xl object-contain"
                                />
                              )}
                              <div
                                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                                  message.role === 'student'
                                    ? 'rounded-br-md bg-amber-50 text-slate-800'
                                    : 'rounded-bl-md border border-violet-100 bg-white'
                                }`}
                              >
                                <p className="whitespace-pre-line">{displayContent}</p>
                                {message.role === 'tutor' && (
                                  <div className="mt-2">
                                    <SpeakButton text={displayContent} context="explanation" />
                                  </div>
                                )}
                                <p className="mt-1 text-right text-[10px] text-slate-400">
                                  {displayTime(message.created_at)}
                                </p>
                              </div>
                              {message.role === 'student' && (
                                <img
                                  src={avatar}
                                  alt=""
                                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                                />
                              )}
                            </div>
                          )
                        })}
                      {pendingMessage && (
                        <div className="flex justify-end gap-2">
                          <div className="max-w-[85%] rounded-2xl rounded-br-md bg-amber-50 px-4 py-3 text-sm leading-6 text-slate-800 opacity-80">
                            <p className="whitespace-pre-line">{pendingMessage}</p>
                          </div>
                          <img
                            src={avatar}
                            alt=""
                            className="h-8 w-8 shrink-0 rounded-full object-cover"
                          />
                        </div>
                      )}
                      {busy && task && (
                        <div className="flex items-center gap-2 text-xs font-bold text-violet-600">
                          <IconPointFilled className="animate-pulse" size={18} />
                          Lumi está pensando…
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {finalSummary && (
                      <div className="mt-4 rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
                        <p className="flex items-center gap-2 text-sm font-black text-emerald-900">
                          <IconTrophy size={18} /> Lo que aprendiste hoy
                        </p>
                        <p className="mt-2 text-sm leading-6 text-emerald-900">{finalSummary}</p>
                        <div className="mt-2">
                          <SpeakButton text={finalSummary} context="explanation" />
                        </div>
                      </div>
                    )}

                    <form
                      onSubmit={(event: FormEvent) => {
                        event.preventDefault()
                        void sendTutorMessage('question')
                      }}
                      className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100"
                    >
                      <input
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder="Escribe tu mensaje…"
                        className="min-w-0 flex-1 bg-transparent px-1 text-sm outline-none"
                      />
                      <VoiceInputButton
                        label="Hablar"
                        cancelLabel="Cancelar"
                        onResult={(text) =>
                          setInput((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text))
                        }
                        className="shrink-0"
                      />
                      <button
                        type="submit"
                        disabled={!input.trim() || busy || offline}
                        aria-label="Enviar mensaje"
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-600 text-white disabled:opacity-40"
                      >
                        <IconSend2 size={18} />
                      </button>
                    </form>
                  </section>

                  <aside className="space-y-4">
                    <section className="rounded-3xl border border-violet-100 bg-white p-4 shadow-sm">
                      <h2 className="font-black">Herramientas</h2>
                      <div className="mt-3 space-y-2">
                        {TOOLS.map((tool) => {
                          const ToolIcon = tool.icon
                          return (
                            <button
                              key={tool.id}
                              type="button"
                              onClick={() => void sendTutorMessage(tool.id)}
                              disabled={
                                busy ||
                                offline ||
                                tool.id === 'question' ||
                                (tool.id === 'review' && !input.trim())
                              }
                              className="flex w-full items-start gap-3 rounded-2xl bg-[#f7f4ff] p-3 text-left transition hover:bg-violet-100 disabled:opacity-45"
                            >
                              <ToolIcon size={19} className="mt-0.5 text-violet-600" />
                              <span>
                                <span className="block text-xs font-black text-violet-800">
                                  {tool.title}
                                </span>
                                <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">
                                  {tool.description}
                                </span>
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </section>

                    <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
                      <p className="flex items-center gap-2 text-xs font-black text-emerald-900">
                        <IconRosetteDiscountCheck size={18} /> Consejo de Lumi
                      </p>
                      <p className="mt-2 text-xs leading-5 text-emerald-900">
                        Lee cada parte con calma y escribe con tus propias palabras. Puedes
                        preguntarme todas las veces que necesites.
                      </p>
                    </section>

                    <button
                      type="button"
                      onClick={() => void finishTask()}
                      disabled={busy || task.status === 'completed'}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-200 disabled:opacity-55"
                    >
                      <IconCircleCheck size={20} />
                      {task.status === 'completed' ? 'Tarea completada' : 'Terminar'}
                    </button>
                  </aside>
                </div>
              )}
            </>
          )}

          {error && (
            <p role="alert" className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </p>
          )}
        </main>
      </div>
    </div>
  )
}

function SideLink({
  to,
  icon: Icon,
  label,
}: {
  to: string
  icon: typeof IconHome
  label: string
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-600 hover:bg-violet-50"
    >
      <Icon size={19} /> {label}
    </Link>
  )
}

function ChipGroup({
  icon: Icon,
  label,
  value,
  onChange,
  options,
}: {
  icon: typeof IconBook2
  label: string
  value: string
  onChange: (value: string) => void
  options: ReadonlyArray<{ value: string; label: string }>
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 flex items-center gap-2 text-xs font-black text-slate-600">
        <Icon size={17} className="text-violet-600" /> {label}
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const selected = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={selected}
              className={`rounded-full px-3 py-2 text-xs font-black transition sm:py-1.5 ${
                selected
                  ? 'bg-violet-600 text-white shadow-sm shadow-violet-200'
                  : 'border border-violet-100 bg-white text-violet-700 hover:bg-violet-50'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function StageTabs({ current }: { current: number }) {
  const steps = ['Subir', 'Entender', 'Hacer conmigo', 'Revisar']
  return (
    <ol className="mt-3 grid grid-cols-4 gap-1.5">
      {steps.map((step, index) => {
        const number = index + 1
        const active = current === number
        const completed = current > number
        return (
          <li
            key={step}
            className={`rounded-xl px-2 py-2 text-center text-[10px] font-black sm:rounded-2xl sm:text-xs ${
              active
                ? 'bg-violet-600 text-white'
                : completed
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-white text-slate-400'
            }`}
          >
            {completed ? <IconCheck size={14} className="mx-auto sm:hidden" /> : null}
            <span className="hidden sm:inline">
              {number}. {step}
            </span>
            <span className="sm:hidden">{completed ? '' : number}</span>
          </li>
        )
      })}
    </ol>
  )
}

function HistoryPanel({
  tasks,
  onSelect,
  onClose,
}: {
  tasks: HomeworkTask[]
  onSelect: (task: HomeworkTask) => void
  onClose: () => void
}) {
  return (
    <section className="mt-3 rounded-3xl border border-violet-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">Mis tareas</h2>
          <p className="text-sm text-slate-500">Retoma una tarea o revisa lo que completaste.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl bg-violet-50 px-4 py-2 text-sm font-black text-violet-700"
        >
          Volver
        </button>
      </div>
      {tasks.length === 0 ? (
        <div className="mt-6 rounded-3xl bg-slate-50 p-8 text-center">
          <IconFileText size={36} className="mx-auto text-slate-300" />
          <p className="mt-3 font-bold text-slate-500">Aún no tienes tareas guardadas.</p>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {tasks.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 p-4 text-left transition hover:border-violet-200 hover:bg-violet-50"
            >
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
                  item.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-violet-100 text-violet-700'
                }`}
              >
                {item.status === 'completed' ? (
                  <IconCircleCheck size={23} />
                ) : (
                  <IconFileText size={23} />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-black">{item.title}</span>
                <span className="mt-1 block text-xs font-semibold text-slate-500">
                  {SUBJECTS.find((subject) => subject.value === item.subject)?.label}
                  {' · '}
                  {item.status === 'completed' ? 'Completada' : 'En progreso'}
                </span>
              </span>
              <IconArrowRight size={18} className="text-slate-300" />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
