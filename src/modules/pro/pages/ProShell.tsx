import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { IconHome, IconLogout, IconRepeat, IconUsers } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { ProProvider, usePro } from '@/modules/pro/lib/ProContext'
import ProHome from '@/modules/pro/pages/ProHome'
import ProLessonPage from '@/modules/pro/pages/ProLessonPage'
import ProReviewPage from '@/modules/pro/pages/ProReviewPage'
import ProOnboarding from '@/modules/pro/components/ProOnboarding'

export default function ProShell() {
  const { session } = useAuth()
  const userId = session?.user.id
  if (!userId) return <Navigate to="/acceso" replace />

  return (
    <ProProvider userId={userId}>
      <ProLayout>
        <ProRoutes />
      </ProLayout>
    </ProProvider>
  )
}

function ProRoutes() {
  const { isLoading, error, settings, refresh } = usePro()

  if (isLoading) {
    return (
      <div className="grid min-h-[50svh] place-items-center text-sm text-pro-muted">
        Cargando tu avance…
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto mt-10 max-w-md rounded-2xl border border-pro-border bg-pro-surface p-6 text-center">
        <p className="text-base text-pro-ink">{error}</p>
        <button
          type="button"
          onClick={() => void refresh()}
          className="mt-4 rounded-xl bg-pro-accent px-4 py-2 text-sm font-bold text-pro-accent-ink hover:bg-pro-accent-hover"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (!settings) return <ProOnboarding />

  return (
    <Routes>
      <Route index element={<ProHome />} />
      <Route path="leccion/:lessonId" element={<ProLessonPage />} />
      <Route path="repaso" element={<ProReviewPage />} />
      <Route path="*" element={<Navigate to="/pro" replace />} />
    </Routes>
  )
}

function ProLayout({ children }: { children: ReactNode }) {
  const { signOut } = useAuth()
  const { due, settings } = usePro()

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-1 rounded-xl px-2 py-2 text-xs font-bold transition-colors sm:gap-1.5 sm:px-3 sm:text-sm ${
      isActive
        ? 'bg-pro-accent-soft text-pro-accent'
        : 'text-pro-muted hover:bg-pro-accent-soft hover:text-pro-ink'
    }`

  return (
    <div className="min-h-svh bg-pro-bg text-pro-ink">
      <header className="border-b border-pro-border bg-pro-surface">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6">
          <NavLink to="/pro" end className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold tracking-tight">Lumi Pro</span>
            <span className="hidden text-xs font-semibold text-pro-muted sm:inline">
              IA para tu trabajo
            </span>
          </NavLink>
          {settings && (
            <nav className="flex items-center gap-0.5 sm:gap-1">
              <NavLink to="/pro" end className={navClass}>
                <IconHome size={17} /> Inicio
              </NavLink>
              <NavLink to="/pro/repaso" className={navClass}>
                <IconRepeat size={17} /> Repaso
                {due.length > 0 && (
                  <span className="ml-0.5 rounded-full bg-pro-accent px-1.5 text-xs text-pro-accent-ink">
                    {due.length}
                  </span>
                )}
              </NavLink>
              <NavLink to="/reporte-padres" className={navClass}>
                <IconUsers size={17} /> Familia
              </NavLink>
              <button
                type="button"
                onClick={() => void signOut()}
                className="inline-flex items-center gap-1 rounded-xl px-2 py-2 text-xs font-bold text-pro-muted hover:bg-pro-accent-soft hover:text-pro-ink sm:gap-1.5 sm:px-3 sm:text-sm"
              >
                <IconLogout size={17} /> Salir
              </button>
            </nav>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">{children}</main>
    </div>
  )
}
