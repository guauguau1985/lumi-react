import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  IconAlertTriangle,
  IconBrain,
  IconChevronDown,
  IconCircleCheck,
  IconClock,
  IconFileText,
  IconFlame,
  IconHelpCircle,
  IconKey,
  IconLock,
  IconLogout,
  IconRefresh,
  IconSettings,
  IconShieldCheck,
  IconSparkles,
  IconStar,
  IconTargetArrow,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react'
import { useAuth, type LumiProfile } from '@/features/auth/AuthContext'
import { supabase } from '@/shared/lib/supabaseClient'
import type { Tables } from '@/shared/lib/database.types'
import { GRADES, SUBJECTS } from '@/modules/tarea/data/curriculumContext'

type HomeworkTask = Tables<'homework_tasks'>
type LearningProfile = Tables<'learning_profile'>

interface ProfileResponse {
  enabled: boolean
  profile: LearningProfile | null
  summary: string | null
  recommendations: string[]
  adaptive_levels?: Record<string, number>
  recent_tasks?: HomeworkTask[]
  stats?: {
    total_events: number
    completed_activities: number
    total_tasks: number
    completed_tasks: number
    average_session_seconds: number
    xp_total: number
    level: number
    streak_days: number
  }
  error?: string
}

function formatDuration(seconds: number) {
  if (!seconds) return 'Sin datos'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} h ${rest} min` : `${hours} h`
}

function subjectLabel(value: string) {
  return SUBJECTS.find((subject) => subject.value === value)?.label ?? value
}

function gradeLabel(value: string | null) {
  return GRADES.find((grade) => grade.value === value)?.label ?? 'Curso no indicado'
}

export default function ParentReportPage() {
  const { profile: parentProfile, signOut } = useAuth()
  const [children, setChildren] = useState<LumiProfile[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [tasks, setTasks] = useState<HomeworkTask[]>([])
  const [report, setReport] = useState<ProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')

  const selectedChild = children.find((child) => child.id === selectedId) ?? null

  const loadChildren = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      await supabase.rpc('claim_family_links')
      const { data: links, error: linksError } = await supabase
        .from('family_links')
        .select('child_id')
      if (linksError) throw linksError
      const childIds = (links ?? []).map((item) => item.child_id)
      if (!childIds.length) {
        setChildren([])
        setSelectedId('')
        return
      }
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', childIds)
        .eq('role', 'student')
      if (profilesError) throw profilesError
      setChildren(profiles ?? [])
      setSelectedId((current) =>
        current && childIds.includes(current) ? current : profiles?.[0]?.id ?? ''
      )
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'No pudimos encontrar los perfiles familiares.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  const loadReport = useCallback(async (childId: string) => {
    if (!childId) return
    setRefreshing(true)
    setError('')
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) throw new Error('Tu sesión terminó. Vuelve a ingresar.')
      const [taskResult, profileResult] = await Promise.all([
        supabase
          .from('homework_tasks')
          .select('*')
          .eq('child_id', childId)
          .order('created_at', { ascending: false })
          .limit(8),
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/compute-profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ child_id: childId }),
        }),
      ])
      if (taskResult.error) throw taskResult.error
      const payload = (await profileResult.json()) as ProfileResponse
      if (!profileResult.ok) throw new Error(payload.error ?? 'No pudimos calcular el reporte.')
      setTasks(payload.recent_tasks ?? taskResult.data ?? [])
      setReport(payload)
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'No pudimos actualizar el reporte.'
      )
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void loadChildren()
  }, [loadChildren])

  useEffect(() => {
    if (selectedId) void loadReport(selectedId)
  }, [selectedId, loadReport])

  const setLearningEnabled = async (enabled: boolean) => {
    if (!selectedId) return
    setRefreshing(true)
    const { error: requestError } = await supabase.rpc('set_child_learning_enabled', {
      p_child_id: selectedId,
      p_enabled: enabled,
    })
    if (requestError) {
      setError(requestError.message)
    } else {
      await loadReport(selectedId)
    }
    setRefreshing(false)
  }

  const deleteLearningData = async () => {
    if (!selectedId) return
    setRefreshing(true)
    const { error: requestError } = await supabase.rpc('delete_child_learning_data', {
      p_child_id: selectedId,
    })
    if (requestError) {
      setError(requestError.message)
    } else {
      setTasks([])
      setReport(null)
      setConfirmDelete(false)
      await loadReport(selectedId)
    }
    setRefreshing(false)
  }

  const changeChildPassword = async () => {
    if (!selectedId || newPassword.length < 8) {
      setPasswordMessage('La nueva contraseña debe tener al menos 8 caracteres.')
      return
    }
    setRefreshing(true)
    setPasswordMessage('')
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) throw new Error('Tu sesión terminó.')
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/family-admin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ child_id: selectedId, password: newPassword }),
        }
      )
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error ?? 'No pudimos cambiarla.')
      setNewPassword('')
      setPasswordMessage('Contraseña actualizada. El estudiante ya puede usarla.')
    } catch (caught) {
      setPasswordMessage(
        caught instanceof Error ? caught.message : 'No pudimos cambiar la contraseña.'
      )
    } finally {
      setRefreshing(false)
    }
  }

  const stats = report?.stats
  const latestTask = tasks[0]
  const completedTasks = tasks.filter((task) => task.status === 'completed').length
  const statusHelp = useMemo(() => {
    const difficulties = report?.profile?.difficulties.length ?? 0
    const blocks = report?.profile?.bloqueo_detectado.length ?? 0
    if (blocks > 0) return { label: 'Necesita apoyo', color: 'text-red-700 bg-red-50' }
    if (difficulties > 0) return { label: 'Moderado', color: 'text-amber-700 bg-amber-50' }
    return { label: 'Autónomo', color: 'text-emerald-700 bg-emerald-50' }
  }, [report])

  return (
    <div className="min-h-svh bg-[#f7f8fc] text-slate-900">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img src="/img/lumi/logo.png" alt="Lumi" className="h-11 w-11 object-contain" />
            <div>
              <p className="text-xl font-black tracking-tight text-violet-700">Lumi Familia</p>
              <p className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                <IconLock size={13} /> Reporte privado para padres y tutores
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-right sm:block">
              <span className="block text-sm font-black">
                {parentProfile?.nombre ?? 'Familia'}
              </span>
              <span className="block text-xs text-slate-400">{parentProfile?.email}</span>
            </span>
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-600"
            >
              <IconLogout size={17} /> Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7">
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            <IconAlertTriangle size={19} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid min-h-[60svh] place-items-center">
            <img
              src="/img/lumi/pensativa.png"
              alt="Lumi cargando"
              className="h-24 w-24 animate-pulse object-contain"
            />
          </div>
        ) : children.length === 0 ? (
          <EmptyFamily onRefresh={() => void loadChildren()} />
        ) : (
          <>
            <section className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black sm:text-3xl">Reporte de aprendizaje</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Una vista clara para acompañar sin interrumpir.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {children.length > 1 && (
                  <label className="relative">
                    <span className="sr-only">Seleccionar estudiante</span>
                    <select
                      value={selectedId}
                      onChange={(event) => setSelectedId(event.target.value)}
                      className="appearance-none rounded-2xl border border-slate-200 bg-white py-2.5 pl-4 pr-9 text-sm font-black"
                    >
                      {children.map((child) => (
                        <option key={child.id} value={child.id}>
                          {child.nombre ?? child.email}
                        </option>
                      ))}
                    </select>
                    <IconChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </label>
                )}
                <button
                  type="button"
                  onClick={() => selectedId && void loadReport(selectedId)}
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50"
                >
                  <IconRefresh size={18} className={refreshing ? 'animate-spin' : ''} />
                  Actualizar
                </button>
              </div>
            </section>

            {selectedChild && (
              <section className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm">
                <div className="grid lg:grid-cols-[1.15fr_.85fr]">
                  <div className="flex gap-4 bg-gradient-to-br from-amber-50 via-white to-violet-50 p-5 sm:p-6">
                    <img
                      src={`/img/avatars/${selectedChild.avatar_key === 'boy' ? 'boy' : 'girl'}.png`}
                      alt={`Avatar de ${selectedChild.nombre ?? 'estudiante'}`}
                      className="h-20 w-20 shrink-0 rounded-full border-4 border-white object-cover shadow-md sm:h-24 sm:w-24"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-wide text-violet-600">
                        Resumen de {selectedChild.nombre ?? 'estudiante'}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {gradeLabel(selectedChild.grade)}
                      </p>
                      <p className="mt-3 text-sm font-bold leading-6 text-slate-700">
                        {report?.summary ??
                          'Lumi está preparando el primer resumen con sus actividades.'}
                      </p>
                      {latestTask && (
                        <p className="mt-2 text-xs text-slate-600">
                          <span className="font-black">Última tarea:</span>{' '}
                          {subjectLabel(latestTask.subject)} — {latestTask.title}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-violet-100 p-5 lg:border-l lg:border-t-0">
                    <h2 className="text-sm font-black">Tareas recientes</h2>
                    <div className="mt-3 space-y-2">
                      {tasks.slice(0, 3).map((task) => (
                        <TaskRow key={task.id} task={task} />
                      ))}
                      {!tasks.length && (
                        <p className="rounded-2xl bg-slate-50 p-4 text-xs font-semibold text-slate-500">
                          Todavía no hay tareas guardadas.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
              <Metric
                icon={IconClock}
                label="Tiempo promedio"
                value={formatDuration(stats?.average_session_seconds ?? 0)}
                tone="blue"
              />
              <Metric
                icon={IconCircleCheck}
                label="Tareas completadas"
                value={`${stats?.completed_tasks ?? completedTasks}/${stats?.total_tasks ?? tasks.length}`}
                tone="green"
              />
              <Metric
                icon={IconStar}
                label="Puntos Lumi"
                value={String(stats?.xp_total ?? 0)}
                tone="amber"
              />
              <Metric
                icon={IconFlame}
                label="Racha"
                value={`${stats?.streak_days ?? 0} días`}
                tone="violet"
              />
              <Metric
                icon={IconHelpCircle}
                label="Nivel de ayuda"
                value={statusHelp.label}
                tone="rose"
                className="col-span-2 lg:col-span-1"
              />
            </section>

            {report?.enabled === false ? (
              <section className="mt-4 rounded-3xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-black text-amber-900">El reporte está pausado</h2>
                    <p className="mt-1 text-sm text-amber-800">
                      El historial se conserva, pero no se calculan nuevas recomendaciones.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void setLearningEnabled(true)}
                    className="rounded-2xl bg-amber-700 px-4 py-2.5 text-sm font-black text-white"
                  >
                    Reactivar
                  </button>
                </div>
              </section>
            ) : (
              <section className="mt-4 grid gap-4 lg:grid-cols-2">
                <InsightCard
                  icon={IconSparkles}
                  title="Fortalezas"
                  items={report?.profile?.strengths ?? []}
                  empty="Aún faltan actividades para reconocer fortalezas estables."
                  tone="emerald"
                />
                <InsightCard
                  icon={IconTargetArrow}
                  title="Áreas para acompañar"
                  items={report?.profile?.difficulties ?? []}
                  empty="No se observan dificultades persistentes."
                  tone="amber"
                />
                <section className="rounded-3xl border border-violet-100 bg-white p-5 shadow-sm lg:col-span-2">
                  <h2 className="flex items-center gap-2 font-black">
                    <IconBrain size={21} className="text-violet-600" />
                    Recomendaciones adaptativas
                  </h2>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {(report?.recommendations ?? []).map((recommendation, index) => (
                      <div
                        key={recommendation}
                        className="rounded-2xl bg-violet-50 p-4 text-sm leading-6 text-violet-950"
                      >
                        <span className="mb-2 grid h-7 w-7 place-items-center rounded-full bg-violet-600 text-xs font-black text-white">
                          {index + 1}
                        </span>
                        {recommendation}
                      </div>
                    ))}
                  </div>
                </section>
              </section>
            )}

            <section className="mt-4 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setShowSettings((value) => !value)}
                className="flex w-full items-center justify-between gap-3 p-5 text-left"
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-slate-600">
                    <IconSettings size={21} />
                  </span>
                  <span>
                    <span className="block font-black">Privacidad y datos</span>
                    <span className="block text-xs text-slate-500">
                      Pausa el reporte o elimina el historial.
                    </span>
                  </span>
                </span>
                <IconChevronDown
                  size={20}
                  className={`text-slate-400 transition ${showSettings ? 'rotate-180' : ''}`}
                />
              </button>

              {showSettings && (
                <div className="border-t border-slate-100 p-5">
                  <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4">
                    <IconShieldCheck size={22} className="shrink-0 text-emerald-700" />
                    <p className="text-xs leading-5 text-emerald-900">
                      Los archivos son privados. Solo la cuenta del estudiante y el correo
                      familiar vinculado pueden consultar este reporte.
                    </p>
                  </div>
                  <div className="mt-4 rounded-2xl border border-violet-100 p-4">
                    <p className="flex items-center gap-2 text-sm font-black">
                      <IconKey size={18} className="text-violet-600" />
                      Restablecer contraseña de {selectedChild?.nombre ?? 'estudiante'}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Esta es la alternativa familiar al correo de recuperación. Lumi no
                      necesita un servicio de correo transaccional.
                    </p>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        minLength={8}
                        placeholder="Nueva contraseña (mínimo 8)"
                        className="lumi-auth-input flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => void changeChildPassword()}
                        disabled={refreshing}
                        className="rounded-2xl bg-violet-600 px-4 py-2.5 text-xs font-black text-white disabled:opacity-50"
                      >
                        Cambiar contraseña
                      </button>
                    </div>
                    {passwordMessage && (
                      <p className="mt-2 text-xs font-bold text-slate-600">
                        {passwordMessage}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {report?.enabled !== false && (
                      <button
                        type="button"
                        onClick={() => void setLearningEnabled(false)}
                        className="rounded-2xl border border-amber-200 px-4 py-2.5 text-xs font-black text-amber-800"
                      >
                        Pausar reporte
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-red-200 px-4 py-2.5 text-xs font-black text-red-700"
                    >
                      <IconTrash size={16} /> Borrar historial
                    </button>
                  </div>

                  {confirmDelete && (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
                      <p className="text-sm font-black text-red-900">
                        Esta acción elimina tareas, chats, progreso y puntos de este perfil.
                      </p>
                      <p className="mt-1 text-xs text-red-700">No se puede deshacer.</p>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => void deleteLearningData()}
                          disabled={refreshing}
                          className="rounded-xl bg-red-700 px-4 py-2 text-xs font-black text-white disabled:opacity-50"
                        >
                          Confirmar eliminación
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(false)}
                          className="rounded-xl bg-white px-4 py-2 text-xs font-black text-slate-600"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

function EmptyFamily({ onRefresh }: { onRefresh: () => void }) {
  return (
    <section className="mx-auto mt-12 max-w-xl rounded-3xl border border-violet-100 bg-white p-7 text-center shadow-sm">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-violet-100 text-violet-700">
        <IconUsers size={32} />
      </span>
      <h1 className="mt-5 text-2xl font-black">Aún no aparece un estudiante vinculado</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        El correo de esta cuenta debe ser exactamente el mismo que el niño indicó como
        correo de su mamá, papá o tutor al registrarse.
      </p>
      <button
        type="button"
        onClick={onRefresh}
        className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-black text-white"
      >
        <IconRefresh size={18} /> Buscar nuevamente
      </button>
    </section>
  )
}

function TaskRow({ task }: { task: HomeworkTask }) {
  const completed = task.status === 'completed'
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 px-3 py-2.5">
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
          completed ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700'
        }`}
      >
        {completed ? <IconCircleCheck size={19} /> : <IconFileText size={19} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-black">{task.title}</span>
        <span className="block text-[11px] text-slate-500">
          {subjectLabel(task.subject)}
        </span>
      </span>
      <span
        className={`rounded-full px-2 py-1 text-[10px] font-black ${
          completed
            ? 'bg-emerald-50 text-emerald-700'
            : task.current_stage >= 3
              ? 'bg-amber-50 text-amber-700'
              : 'bg-blue-50 text-blue-700'
        }`}
      >
        {completed ? 'Completada' : task.current_stage >= 3 ? 'En progreso' : 'Pendiente'}
      </span>
    </div>
  )
}

const METRIC_TONES = {
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  violet: 'bg-violet-50 text-violet-700',
  rose: 'bg-rose-50 text-rose-700',
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
  className = '',
}: {
  icon: typeof IconClock
  label: string
  value: string
  tone: keyof typeof METRIC_TONES
  className?: string
}) {
  return (
    <div className={`rounded-3xl border border-slate-100 bg-white p-4 shadow-sm ${className}`}>
      <span className={`grid h-9 w-9 place-items-center rounded-2xl ${METRIC_TONES[tone]}`}>
        <Icon size={19} />
      </span>
      <p className="mt-3 text-[11px] font-bold text-slate-500">{label}</p>
      <p className="mt-0.5 text-lg font-black">{value}</p>
    </div>
  )
}

function InsightCard({
  icon: Icon,
  title,
  items,
  empty,
  tone,
}: {
  icon: typeof IconSparkles
  title: string
  items: string[]
  empty: string
  tone: 'emerald' | 'amber'
}) {
  const colors =
    tone === 'emerald'
      ? 'border-emerald-100 bg-emerald-50 text-emerald-800'
      : 'border-amber-100 bg-amber-50 text-amber-800'
  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 font-black">
        <Icon
          size={21}
          className={tone === 'emerald' ? 'text-emerald-600' : 'text-amber-600'}
        />
        {title}
      </h2>
      {items.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className={`rounded-full border px-3 py-1.5 text-xs font-black ${colors}`}
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-500">{empty}</p>
      )}
    </section>
  )
}
