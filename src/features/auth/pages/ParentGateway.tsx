import { useNavigate } from 'react-router-dom'
import {
  IconArrowLeft,
  IconLogin2,
  IconShieldLock,
  IconUserPlus,
} from '@tabler/icons-react'
import { useAuth } from '@/features/auth/AuthContext'

export default function ParentGateway() {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const continueAsParent = async (mode: 'signin' | 'signup') => {
    sessionStorage.setItem('lumi-parent-access-mode', mode)
    await signOut()
  }

  return (
    <main className="min-h-svh bg-[linear-gradient(155deg,#f5efff_0%,#fbfbff_48%,#effbf4_100%)] px-4 py-10">
      <section className="mx-auto max-w-md rounded-[30px] border border-violet-100 bg-white p-6 text-center shadow-[0_24px_70px_rgba(88,50,160,0.14)]">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-5 flex items-center gap-1 text-sm font-extrabold text-violet-600"
        >
          <IconArrowLeft size={18} /> Volver
        </button>
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-[26px] bg-violet-100">
          <IconShieldLock size={42} className="text-violet-650" />
        </div>
        <h1 className="mt-5 text-2xl font-black text-slate-900">
          Reporte familiar
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Este espacio es privado para mamá, papá o tutor. Para abrirlo,
          cambiaremos de la cuenta del estudiante a una cuenta familiar.
        </p>

        <div className="mt-7 space-y-3 text-left">
          <button
            type="button"
            onClick={() => continueAsParent('signin')}
            className="flex w-full items-center gap-4 rounded-3xl border-2 border-violet-100 bg-violet-50 p-4 text-left transition hover:border-violet-300"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-600 text-white">
              <IconLogin2 size={23} />
            </span>
            <span>
              <strong className="block text-sm text-slate-900">Ingresa tu correo</strong>
              <span className="text-xs text-slate-500">Ya tienes una cuenta familiar</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => continueAsParent('signup')}
            className="flex w-full items-center gap-4 rounded-3xl border-2 border-emerald-100 bg-emerald-50 p-4 text-left transition hover:border-emerald-300"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-600 text-white">
              <IconUserPlus size={23} />
            </span>
            <span>
              <strong className="block text-sm text-slate-900">Regístrate</strong>
              <span className="text-xs text-slate-500">Es tu primera vez en el reporte</span>
            </span>
          </button>
        </div>
      </section>
    </main>
  )
}
