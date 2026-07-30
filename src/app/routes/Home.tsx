import { motion, type Variants } from 'framer-motion'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  IconAtom2,
  IconBook2,
  IconBrain,
  IconCalculator,
  IconChartDots,
  IconCode,
  IconLanguage,
  IconLeaf,
  IconLogout,
  IconMail,
  IconSchool,
  IconTrophy,
} from '@tabler/icons-react'
import { useAuth } from '@/features/auth/AuthContext'
import { useGamification } from '@/gamification/GamificationContext'
import { GRADES } from '@/modules/tarea/data/curriculumContext'
import { supabase } from '@/shared/lib/supabaseClient'

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.08 },
  },
}

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 220, damping: 18 },
  },
}

const MODULES = [
  {
    to: '/math',
    title: 'Matemáticas',
    description: 'Juega, practica y resuelve desafíos',
    icon: IconCalculator,
    colors: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  },
  {
    to: '/eco',
    title: 'Ecología',
    description: 'Aprende a cuidar nuestro entorno',
    icon: IconLeaf,
    colors: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  {
    to: '/naturales',
    title: 'Ciencias naturales',
    description: 'Descubre cómo funciona el mundo',
    icon: IconAtom2,
    colors: 'border-sky-200 bg-sky-50 text-sky-700',
  },
  {
    to: '/coder',
    title: 'Programación',
    description: 'Crea soluciones paso a paso',
    icon: IconCode,
    colors: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  {
    to: '/tarea?subject=ingles',
    title: 'Inglés',
    description: 'Comprende, escribe y practica',
    icon: IconLanguage,
    colors: 'border-blue-200 bg-blue-50 text-blue-700',
  },
  {
    to: '/ai',
    title: 'Lumi tutora',
    description: 'Pregunta y recibe una explicación',
    icon: IconBrain,
    colors: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700',
  },
]

export default function Home() {
  const { profile, signOut, refreshProfile } = useAuth()
  const { profile: game } = useGamification()
  const avatar = profile?.avatar_key === 'boy' ? 'boy' : 'girl'
  const grade =
    GRADES.find((item) => item.value === profile?.grade)?.label ?? 'Completa tu curso'

  return (
    <motion.div
      className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {profile && (!profile.grade || !profile.parent_email || !profile.avatar_key) && (
        <CompleteStudentProfile
          userId={profile.id}
          currentGrade={profile.grade}
          currentAvatar={profile.avatar_key}
          onSaved={() => void refreshProfile()}
        />
      )}
      <div className="bg-[#1a7a3c]">
        <motion.header
          variants={item}
          className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 text-white"
        >
          <div className="flex items-center gap-3">
            <img
              src={`/img/avatars/${avatar}.png`}
              alt="Tu avatar"
              className="h-11 w-11 rounded-full border-2 border-white/70 object-cover"
            />
            <div>
              <p className="text-sm font-black">Hola, {profile?.nombre ?? 'estudiante'}</p>
              <p className="text-xs text-emerald-100">{grade}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/liga"
              className="inline-flex items-center gap-1 rounded-xl bg-white/15 px-3 py-2 text-xs font-black"
            >
              <IconTrophy size={17} /> {game.xpTotal} puntos
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              aria-label="Cerrar sesión"
              className="grid h-9 w-9 place-items-center rounded-xl bg-white/15"
            >
              <IconLogout size={18} />
            </button>
          </div>
        </motion.header>
        <motion.div variants={item} className="w-full">
          <img
            src="/img/banner/banner.png"
            alt="Lumi te acompaña a aprender"
            className="mx-auto block h-auto w-full object-contain md:max-h-[300px] lg:max-h-[400px]"
          />
        </motion.div>
      </div>

      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-5">
        <motion.section variants={item}>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h1 className="text-xl font-black">¿Qué quieres aprender hoy?</h1>
              <p className="text-xs font-semibold text-slate-500">
                Tu avance y tus puntos quedan guardados automáticamente.
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {MODULES.map((module) => {
              const ModuleIcon = module.icon
              return (
                <motion.div key={module.to} variants={item}>
                  <Link
                    to={module.to}
                    className={`flex items-center gap-3 rounded-3xl border-2 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${module.colors}`}
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/80">
                      <ModuleIcon size={24} />
                    </span>
                    <span>
                      <span className="block font-black">{module.title}</span>
                      <span className="mt-0.5 block text-xs font-semibold opacity-75">
                        {module.description}
                      </span>
                    </span>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        <motion.section variants={item} className="grid gap-3 sm:grid-cols-[1.35fr_.65fr]">
          <Link
            to="/tarea"
            className="flex items-center gap-4 rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-5 text-white shadow-lg shadow-violet-200"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15">
              <IconBook2 size={27} />
            </span>
            <span>
              <span className="block text-lg font-black">Ayúdame con mi tarea</span>
              <span className="block text-xs font-semibold text-violet-100">
                Sube un archivo y avanza con Lumi
              </span>
            </span>
          </Link>

          <Link
            to="/familia"
            className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-5 text-slate-700 shadow-sm"
          >
            <IconChartDots size={26} className="text-emerald-600" />
            <span>
              <span className="block text-sm font-black">Reporte de aprendizaje</span>
              <span className="block text-xs text-slate-500">Solo para padres</span>
            </span>
          </Link>
        </motion.section>
      </main>
    </motion.div>
  )
}

function CompleteStudentProfile({
  userId,
  currentGrade,
  currentAvatar,
  onSaved,
}: {
  userId: string
  currentGrade: string | null
  currentAvatar: 'girl' | 'boy' | null
  onSaved: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const grade = String(form.get('grade') ?? '')
    const avatarKey = String(form.get('avatar_key') ?? 'girl')
    const parentEmail = String(form.get('parent_email') ?? '').trim().toLowerCase()
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        grade: grade as '5-basico' | '6-basico' | '7-basico' | '8-basico' | '1-medio',
        avatar_key: avatarKey as 'girl' | 'boy',
        parent_email: parentEmail,
      })
      .eq('id', userId)
    if (updateError) {
      setError('No pudimos guardar los datos. Revisa el correo e intenta nuevamente.')
    } else {
      onSaved()
    }
    setBusy(false)
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/70 p-4">
      <section className="my-6 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="text-center text-2xl font-black">Completa tu perfil Lumi</h2>
        <p className="mt-2 text-center text-sm leading-6 text-slate-500">
          Solo falta indicar tu curso, avatar y el correo familiar que podrá ver tu
          reporte.
        </p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-black text-slate-700">
              <IconSchool size={18} className="text-violet-600" /> Curso
            </span>
            <select
              name="grade"
              required
              defaultValue={currentGrade ?? ''}
              className="lumi-auth-input"
            >
              <option value="">Elige tu curso</option>
              {GRADES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <fieldset>
            <legend className="mb-2 text-sm font-black text-slate-700">Avatar</legend>
            <div className="grid grid-cols-2 gap-3">
              {(['girl', 'boy'] as const).map((avatar) => (
                <label
                  key={avatar}
                  className="cursor-pointer rounded-3xl border-2 border-slate-100 p-2 has-[:checked]:border-violet-500 has-[:checked]:bg-violet-50"
                >
                  <input
                    type="radio"
                    name="avatar_key"
                    value={avatar}
                    defaultChecked={(currentAvatar ?? 'girl') === avatar}
                    className="sr-only"
                  />
                  <img
                    src={`/img/avatars/${avatar}.png`}
                    alt={avatar === 'girl' ? 'Avatar de niña' : 'Avatar de niño'}
                    className="aspect-square w-full rounded-2xl object-cover"
                  />
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-black text-slate-700">
              <IconMail size={18} className="text-violet-600" /> Correo de mamá, papá o
              tutor
            </span>
            <input
              name="parent_email"
              type="email"
              required
              placeholder="familia@correo.com"
              className="lumi-auth-input"
            />
          </label>

          {error && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-violet-600 px-4 py-3.5 text-sm font-black text-white disabled:opacity-50"
          >
            {busy ? 'Guardando…' : 'Guardar y comenzar'}
          </button>
        </form>
      </section>
    </div>
  )
}
