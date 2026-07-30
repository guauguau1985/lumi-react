import { useMemo, useState, type FormEvent } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import {
  IconArrowLeft,
  IconBook2,
  IconCheck,
  IconEye,
  IconEyeOff,
  IconHeartHandshake,
  IconLock,
  IconMail,
  IconSchool,
  IconUser,
  IconUsers,
} from '@tabler/icons-react'
import { supabase } from '@/shared/lib/supabaseClient'
import { useAuth } from '@/features/auth/AuthContext'

type Role = 'student' | 'parent'
type Mode = 'choose' | 'signin' | 'signup'

const GRADES = [
  { value: '5-basico', label: '5° Básico' },
  { value: '6-basico', label: '6° Básico' },
  { value: '7-basico', label: '7° Básico' },
  { value: '8-basico', label: '8° Básico' },
  { value: '1-medio', label: '1° Medio' },
] as const

function readableError(message: string) {
  const value = message.toLowerCase()
  if (value.includes('invalid login credentials')) {
    return 'El correo o la contraseña no coinciden.'
  }
  if (value.includes('already registered') || value.includes('already exists')) {
    return 'Ese correo ya tiene una cuenta. Prueba iniciar sesión.'
  }
  if (value.includes('password')) {
    return 'La contraseña debe tener al menos 8 caracteres.'
  }
  if (value.includes('email')) return 'Revisa que el correo esté bien escrito.'
  return 'No pudimos completar el acceso. Intenta nuevamente.'
}

export default function AccessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { session, profile, isLoading, refreshProfile } = useAuth()
  const storedParentMode = sessionStorage.getItem('lumi-parent-access-mode')
  const initialRole =
    searchParams.get('role') === 'parent' || storedParentMode ? 'parent' : 'student'
  const initialModeValue = searchParams.get('mode') ?? storedParentMode
  const initialMode: Mode =
    initialModeValue === 'signin' || initialModeValue === 'signup'
      ? initialModeValue
      : 'choose'
  const [role, setRole] = useState<Role>(initialRole)
  const [mode, setMode] = useState<Mode>(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (storedParentMode) sessionStorage.removeItem('lumi-parent-access-mode')

  const title = useMemo(() => {
    if (mode === 'choose') return '¿Quién va a usar Lumi?'
    if (mode === 'signin') {
      return role === 'student' ? '¡Hola de nuevo!' : 'Acceso para la familia'
    }
    return role === 'student' ? 'Crea tu perfil Lumi' : 'Crea tu acceso familiar'
  }, [mode, role])

  if (!isLoading && session && profile) {
    return <Navigate to={profile.role === 'parent' ? '/reporte-padres' : '/'} replace />
  }

  const choose = (nextRole: Role, nextMode: Exclude<Mode, 'choose'>) => {
    setRole(nextRole)
    setMode(nextMode)
    setError('')
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')

    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '').trim().toLowerCase()
    const password = String(form.get('password') ?? '')

    try {
      if (mode === 'signin') {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (authError) throw authError

        const loaded = await refreshProfile()
        const destination =
          loaded?.role === 'parent' || data.user.user_metadata.role === 'parent'
            ? '/reporte-padres'
            : '/'
        navigate(destination, { replace: true })
        return
      }

      const displayName = String(form.get('display_name') ?? '').trim()
      const grade = role === 'student' ? String(form.get('grade') ?? '') : null
      const avatarKey =
        role === 'student' ? String(form.get('avatar_key') ?? 'girl') : null
      const parentEmail =
        role === 'student'
          ? String(form.get('parent_email') ?? '').trim().toLowerCase()
          : null
      const consent = role === 'parent' ? form.get('consent') === 'on' : true

      if (!displayName || !email || password.length < 8) {
        throw new Error('Completa todos los datos y usa una contraseña de 8 caracteres.')
      }
      if (role === 'student' && (!grade || !parentEmail)) {
        throw new Error('Indica tu curso y el correo de tu mamá, papá o tutor.')
      }
      if (role === 'parent' && !consent) {
        throw new Error('Necesitamos tu autorización para crear los reportes familiares.')
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            display_name: displayName,
            grade,
            avatar_key: avatarKey,
            parent_email: parentEmail,
          },
        },
      })
      if (authError) throw authError
      if (!data.session || !data.user) {
        throw new Error(
          'La cuenta fue creada, pero el acceso automático no está activo todavía.'
        )
      }

      const loaded = await refreshProfile()
      if (role === 'parent') {
        await supabase.rpc('claim_family_links')
        if (consent) {
          const { data: links } = await supabase
            .from('family_links')
            .select('child_id')
            .eq('parent_id', data.user.id)
          await Promise.all(
            (links ?? []).map(({ child_id }) =>
              supabase.rpc('set_child_learning_enabled', {
                p_child_id: child_id,
                p_enabled: true,
              })
            )
          )
        }
      }

      navigate(
        loaded?.role === 'parent' || role === 'parent' ? '/reporte-padres' : '/',
        { replace: true }
      )
    } catch (caught) {
      setError(
        caught instanceof Error ? readableError(caught.message) : 'No pudimos continuar.'
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_top,_#f0e9ff_0,_#f8f8fd_42%,_#eefaf4_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3">
          <img src="/img/lumi/face.png" alt="Lumi" className="h-14 w-14 object-contain" />
          <div>
            <p className="text-3xl font-black tracking-tight text-violet-700">Lumi</p>
            <p className="text-xs font-semibold text-violet-500">Aprende a tu manera</p>
          </div>
        </div>

        <section className="rounded-[28px] border border-violet-100 bg-white/95 p-5 shadow-[0_24px_70px_rgba(88,50,160,0.14)] sm:p-7">
          {mode !== 'choose' && (
            <button
              type="button"
              onClick={() => {
                setMode('choose')
                setError('')
              }}
              className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-violet-600"
            >
              <IconArrowLeft size={17} /> Volver
            </button>
          )}

          <h1 className="text-center text-2xl font-black text-slate-900">{title}</h1>
          <p className="mx-auto mt-2 max-w-sm text-center text-sm leading-6 text-slate-500">
            {mode === 'choose'
              ? 'Cada persona entra con su propio correo para que el avance quede bien guardado.'
              : role === 'student'
                ? 'Tu progreso, tareas y premios quedarán guardados en tu cuenta.'
                : 'Revisa el avance de tus hijos sin interrumpir su momento de estudio.'}
          </p>

          {mode === 'choose' ? (
            <div className="mt-7 space-y-4">
              <div className="rounded-3xl border-2 border-violet-100 bg-violet-50/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-600 text-white">
                    <IconBook2 size={24} />
                  </div>
                  <div>
                    <p className="font-black">Soy estudiante</p>
                    <p className="text-xs text-slate-500">Quiero estudiar y ganar puntos</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => choose('student', 'signin')}
                    className="rounded-2xl border border-violet-200 bg-white px-3 py-2.5 text-sm font-bold text-violet-700"
                  >
                    Ingresar
                  </button>
                  <button
                    type="button"
                    onClick={() => choose('student', 'signup')}
                    className="rounded-2xl bg-violet-600 px-3 py-2.5 text-sm font-bold text-white"
                  >
                    Registrarme
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border-2 border-emerald-100 bg-emerald-50/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-600 text-white">
                    <IconUsers size={24} />
                  </div>
                  <div>
                    <p className="font-black">Soy mamá, papá o tutor</p>
                    <p className="text-xs text-slate-500">Quiero ver el reporte familiar</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => choose('parent', 'signin')}
                    className="rounded-2xl border border-emerald-200 bg-white px-3 py-2.5 text-sm font-bold text-emerald-700"
                  >
                    Ingresar
                  </button>
                  <button
                    type="button"
                    onClick={() => choose('parent', 'signup')}
                    className="rounded-2xl bg-emerald-600 px-3 py-2.5 text-sm font-bold text-white"
                  >
                    Registrarme
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === 'signup' && (
                <Field icon={<IconUser size={19} />} label="Nombre o apodo">
                  <input
                    name="display_name"
                    required
                    maxLength={40}
                    placeholder={role === 'student' ? '¿Cómo quieres que te llamemos?' : 'Tu nombre'}
                    className="lumi-auth-input"
                  />
                </Field>
              )}

              <Field icon={<IconMail size={19} />} label="Correo electrónico">
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="nombre@correo.com"
                  className="lumi-auth-input"
                />
              </Field>

              <Field icon={<IconLock size={19} />} label="Contraseña">
                <div className="flex items-center">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    placeholder="Mínimo 8 caracteres"
                    className="lumi-auth-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="-ml-9 text-slate-400"
                  >
                    {showPassword ? <IconEyeOff size={19} /> : <IconEye size={19} />}
                  </button>
                </div>
              </Field>

              {mode === 'signup' && role === 'student' && (
                <>
                  <Field icon={<IconSchool size={19} />} label="¿En qué curso estás?">
                    <select name="grade" required className="lumi-auth-input">
                      <option value="">Elige tu curso</option>
                      {GRADES.map((grade) => (
                        <option key={grade.value} value={grade.value}>
                          {grade.label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <fieldset>
                    <legend className="mb-2 text-sm font-extrabold text-slate-700">
                      Elige tu avatar
                    </legend>
                    <div className="grid grid-cols-2 gap-3">
                      {(['girl', 'boy'] as const).map((avatar) => (
                        <label
                          key={avatar}
                          className="group cursor-pointer rounded-3xl border-2 border-slate-100 p-2 text-center has-[:checked]:border-violet-500 has-[:checked]:bg-violet-50"
                        >
                          <input
                            type="radio"
                            name="avatar_key"
                            value={avatar}
                            defaultChecked={avatar === 'girl'}
                            className="sr-only"
                          />
                          <img
                            src={`/img/avatars/${avatar}.png`}
                            alt={avatar === 'girl' ? 'Avatar de niña' : 'Avatar de niño'}
                            className="aspect-square w-full rounded-2xl object-cover"
                          />
                          <span className="mt-1 block text-xs font-bold text-slate-600">
                            {avatar === 'girl' ? 'Avatar niña' : 'Avatar niño'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <Field
                    icon={<IconHeartHandshake size={19} />}
                    label="Correo de tu mamá, papá o tutor"
                  >
                    <input
                      name="parent_email"
                      type="email"
                      required
                      placeholder="correo@familia.com"
                      className="lumi-auth-input"
                    />
                  </Field>
                  <p className="rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
                    Ese mismo correo se usará para abrir tu reporte familiar.
                  </p>
                </>
              )}

              {mode === 'signup' && role === 'parent' && (
                <label className="flex cursor-pointer gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <input
                    type="checkbox"
                    name="consent"
                    required
                    className="mt-0.5 h-5 w-5 accent-emerald-600"
                  />
                  <span className="text-xs leading-5 text-emerald-900">
                    Autorizo que Lumi guarde el progreso escolar de mis hijos vinculados
                    para mostrarme reportes y recomendaciones.
                  </span>
                </label>
              )}

              {error && (
                <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-black text-white shadow-lg transition disabled:opacity-60 ${
                  role === 'parent'
                    ? 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700'
                    : 'bg-violet-600 shadow-violet-200 hover:bg-violet-700'
                }`}
              >
                {busy ? (
                  'Un momento...'
                ) : (
                  <>
                    <IconCheck size={19} />
                    {mode === 'signin' ? 'Entrar a Lumi' : 'Crear mi cuenta'}
                  </>
                )}
              </button>
            </form>
          )}
        </section>
        <p className="mt-4 text-center text-xs text-slate-400">
          Lumi guarda contraseñas de forma segura y nunca las muestra.
        </p>
      </div>
    </main>
  )
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-extrabold text-slate-700">
        <span className="text-violet-500">{icon}</span>
        {label}
      </span>
      {children}
    </label>
  )
}
