import { Navigate, Route, Routes } from 'react-router-dom'
import { Suspense, lazy, type ReactNode } from 'react'
import Home from '@/app/routes/Home'
import { modules } from '@/shared/config/modules'
import LumiCelebrationOverlay from '@/shared/components/lumi/LumiCelebrationOverlay'
import LumiStatusBar from '@/shared/components/lumi/LumiStatusBar'
import { useAuth } from '@/features/auth/AuthContext'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'

const EcoModule = lazy(() => import('@/modules/eco/pages/EcoHome'))
const MathModule = lazy(() => import('@/modules/math/pages/MathShell'))
const NaturalesModule = lazy(() => import('@/modules/naturales/NaturalesShell'))
const CoderModule = lazy(() => import('@/modules/coder/pages/CoderHome'))
const AIModule = lazy(() => import('@/modules/ai/AIShell'))
const TareaModule = lazy(() => import('@/modules/tarea/pages/TareaShell'))
const ParentReport = lazy(() => import('@/modules/ai/pages/ParentReportPage'))
const AccessPage = lazy(() => import('@/features/auth/pages/AccessPage'))
const ParentGateway = lazy(() => import('@/features/auth/pages/ParentGateway'))
const LeaguePage = lazy(() => import('@/modules/liga/LeaguePage'))
const VoicePlayground = lazy(() => import('@/app/routes/VoicePlayground'))

function StudentRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute role="student">{children}</ProtectedRoute>
}

export default function App() {
  const { session, profile } = useAuth()
  const showStudentChrome = Boolean(session && profile?.role === 'student')

  return (
    <>
      {showStudentChrome && <LumiCelebrationOverlay />}
      {showStudentChrome && <LumiStatusBar />}

      <Suspense
        fallback={
          <div className="grid min-h-[50svh] place-items-center">
            <img
              src="/img/lumi/face.png"
              alt="Lumi cargando"
              className="h-24 w-24 animate-pulse object-contain"
            />
          </div>
        }
      >
        <Routes>
          <Route path="/acceso" element={<AccessPage />} />
          <Route
            path="/"
            element={
              <StudentRoute>
                <Home />
              </StudentRoute>
            }
          />

          {modules.eco && (
            <Route
              path="/eco/*"
              element={
                <StudentRoute>
                  <EcoModule />
                </StudentRoute>
              }
            />
          )}
          {modules.math && (
            <Route
              path="/math/*"
              element={
                <StudentRoute>
                  <MathModule />
                </StudentRoute>
              }
            />
          )}
          {modules.naturales && (
            <Route
              path="/naturales/*"
              element={
                <StudentRoute>
                  <NaturalesModule />
                </StudentRoute>
              }
            />
          )}
          {modules.coder && (
            <Route
              path="/coder/*"
              element={
                <StudentRoute>
                  <CoderModule />
                </StudentRoute>
              }
            />
          )}
          {modules.ai && (
            <Route
              path="/ai/*"
              element={
                <StudentRoute>
                  <AIModule />
                </StudentRoute>
              }
            />
          )}
          {modules.tarea && (
            <Route
              path="/tarea/*"
              element={
                <StudentRoute>
                  <TareaModule />
                </StudentRoute>
              }
            />
          )}
          <Route
            path="/liga"
            element={
              <StudentRoute>
                <LeaguePage />
              </StudentRoute>
            }
          />
          <Route
            path="/familia"
            element={
              <StudentRoute>
                <ParentGateway />
              </StudentRoute>
            }
          />
          <Route
            path="/reporte-padres"
            element={
              <ProtectedRoute role="parent">
                <ParentReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/voz-prueba"
            element={
              <ProtectedRoute role="parent">
                <VoicePlayground />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <Navigate
                to={
                  !session
                    ? '/acceso'
                    : profile?.role === 'parent'
                      ? '/reporte-padres'
                      : '/'
                }
                replace
              />
            }
          />
        </Routes>
      </Suspense>
    </>
  )
}
