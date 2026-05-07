import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLearningProfile } from '@/shared/hooks/useLearningProfile'
import type { StoredProfile } from '@/shared/hooks/useLearningProfile'

// ─── helpers ────────────────────────────────────────────────────────────────

function confidenceLabel(c: StoredProfile['data_confidence']) {
  return c === 'alta' ? 'Alta' : c === 'media' ? 'Media' : 'Baja'
}

function confidenceColor(c: StoredProfile['data_confidence']) {
  return c === 'alta'
    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
    : c === 'media'
    ? 'bg-amber-100 text-amber-800 border-amber-200'
    : 'bg-slate-100 text-slate-600 border-slate-200'
}

function confidenceDesc(c: StoredProfile['data_confidence'], total: number) {
  if (c === 'alta') return `Con ${total} sesiones registradas, el análisis es muy confiable.`
  if (c === 'media') return `Con ${total} sesiones registradas, el análisis es moderadamente confiable. Sigue usando Lumi para mejorar la precisión.`
  return `Solo hay ${total} sesión${total === 1 ? '' : 'es'} registrada${total === 1 ? '' : 's'}. Las recomendaciones son preliminares y mejorarán con más uso.`
}

function styleLabel(s: StoredProfile['learning_style']) {
  if (!s) return '—'
  return s === 'visual' ? 'Visual'
    : s === 'texto' ? 'Lectura/texto'
    : s === 'interactivo' ? 'Interactivo'
    : 'Mixto (variado)'
}

function styleDesc(s: StoredProfile['learning_style']) {
  if (!s) return 'Aún no hay suficientes datos para determinar el estilo de aprendizaje.'
  if (s === 'visual') return 'Aprende mejor con imágenes, diagramas y ejercicios visuales.'
  if (s === 'texto') return 'Procesa bien la información escrita y las explicaciones textuales.'
  if (s === 'interactivo') return 'Aprende haciendo — responde muy bien a ejercicios prácticos e interactivos.'
  return 'Se adapta bien a distintos formatos. Disfruta variedad en los ejercicios.'
}

function sessionLabel(s: StoredProfile['session_preference']) {
  if (!s) return '—'
  return s === 'corta' ? 'Corta (menos de 15 min)' : s === 'media' ? 'Media (15–30 min)' : 'Larga (más de 30 min)'
}

function sessionTip(s: StoredProfile['session_preference']) {
  if (!s) return 'Aún no hay datos de sesiones completadas.'
  if (s === 'corta') return 'Prefiere sesiones breves y frecuentes. Varias veces al día funciona mejor que una sesión larga.'
  if (s === 'media') return 'Rinde bien en sesiones de 15 a 30 minutos. Un bloque diario es ideal.'
  return 'Puede mantener concentración en sesiones largas. Útil para repasos profundos.'
}

// ─── sub-componentes ─────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-surface)] p-5 space-y-3">
      <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--color-foreground)] uppercase tracking-wide">
        <span>{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  )
}

function TagList({ items, emptyText, color }: { items: string[]; emptyText: string; color: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-[var(--color-muted-foreground)] italic">{emptyText}</p>
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className={`px-3 py-1 rounded-full text-xs font-medium border ${color}`}>
          {item}
        </span>
      ))}
    </div>
  )
}

// ─── pantalla de consentimiento ───────────────────────────────────────────────

function ConsentScreen({ onEnable, isLoading }: { onEnable: () => void; isLoading: boolean }) {
  return (
    <div className="max-w-lg mx-auto space-y-6 text-center">
      <div className="text-5xl">📊</div>
      <div>
        <h1 className="text-xl font-bold text-[var(--color-foreground)]">
          Reporte de aprendizaje
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          Analiza el progreso, el estilo de aprendizaje y las áreas de mejora de tu hijo/a.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-surface)] p-5 text-left space-y-3">
        <p className="text-sm font-semibold text-[var(--color-foreground)]">¿Qué datos se analizan?</p>
        <ul className="text-sm text-[var(--color-muted-foreground)] space-y-1.5">
          <li>• Resultados de ejercicios (aciertos, errores, niveles)</li>
          <li>• Tiempo y frecuencia de cada sesión</li>
          <li>• Horarios de mejor rendimiento</li>
          <li>• Módulos con fortalezas o dificultades</li>
        </ul>
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <p className="text-xs text-amber-800">
            Los datos se almacenan de forma segura en Supabase y no se comparten con terceros.
            Puedes desactivar el perfil en cualquier momento desde esta pantalla.
          </p>
        </div>
      </div>

      <button
        onClick={onEnable}
        disabled={isLoading}
        className="
          w-full py-3 rounded-2xl font-bold text-white text-sm
          bg-[var(--color-ai-dot)]
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-opacity
        "
      >
        {isLoading ? 'Activando...' : 'Activar perfil de aprendizaje'}
      </button>
      <p className="text-xs text-[var(--color-muted-foreground)]">
        Al activar, aceptas el análisis de los datos de uso de Lumi para generar este reporte.
      </p>
    </div>
  )
}

// ─── pantalla de carga ────────────────────────────────────────────────────────

function ComputingScreen() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex gap-1.5">
        {[0, 150, 300].map((d) => (
          <span
            key={d}
            className="w-3 h-3 rounded-full bg-[var(--color-ai-dot)] animate-bounce"
            style={{ animationDelay: `${d}ms` }}
          />
        ))}
      </div>
      <p className="text-sm text-[var(--color-muted-foreground)]">Analizando datos de aprendizaje…</p>
      <p className="text-xs text-[var(--color-muted-foreground)]">Esto puede tomar unos segundos</p>
    </div>
  )
}

// ─── página principal ─────────────────────────────────────────────────────────

export default function ParentReportPage() {
  const { profile, summary, recommendations, isEnabled, isLoading, isComputing, error, compute, enable, disable, deleteProfile } =
    useLearningProfile()

  const [showDisableConfirm, setShowDisableConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1)
  const [isDeleting, setIsDeleting] = useState(false)

  // Una vez habilitado y cargado desde DB, calcular automáticamente si no hay datos de sesión actuales
  useEffect(() => {
    if (isEnabled && !isLoading && !isComputing) {
      compute()
    }
    // Solo al montar con perfil habilitado
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled, isLoading])

  const handleEnable = async () => {
    await enable()
    await compute()
  }

  const handleDisable = async () => {
    await disable()
    setShowDisableConfirm(false)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    await deleteProfile()
    setIsDeleting(false)
    setShowDeleteConfirm(false)
    setDeleteStep(1)
  }

  const lastUpdated = profile?.last_updated
    ? new Date(profile.last_updated).toLocaleDateString('es-CL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div className="min-h-svh bg-[var(--color-background)]">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-card-border)] bg-[var(--color-surface)]">
        <Link
          to="/"
          className="px-3 py-1 rounded-lg border text-sm bg-[var(--color-surface)] border-[var(--color-card-border)] text-[var(--color-foreground)]"
        >
          ⬅️ Inicio
        </Link>
        <div>
          <h1 className="text-base font-extrabold text-[var(--color-ai-text)]">
            📊 Reporte de aprendizaje
          </h1>
          <p className="text-xs text-[var(--color-muted-foreground)]">Para padres y tutores</p>
        </div>
      </header>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Error global */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Estado: cargando desde DB */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-[var(--color-ai-dot)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Estado: no habilitado → pantalla de consentimiento */}
        {!isLoading && isEnabled === false && (
          <ConsentScreen onEnable={handleEnable} isLoading={isComputing} />
        )}

        {/* Estado: calculando con IA */}
        {!isLoading && isEnabled && isComputing && !profile && (
          <ComputingScreen />
        )}

        {/* Estado: perfil disponible */}
        {!isLoading && isEnabled && profile && (
          <div className="space-y-4">
            {/* Cabecera del reporte */}
            <div className="flex items-center justify-between">
              <div>
                {lastUpdated && (
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    Actualizado: {lastUpdated}
                  </p>
                )}
              </div>
              <button
                onClick={compute}
                disabled={isComputing}
                className="
                  flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
                  bg-[var(--color-ai-dot)] text-white
                  disabled:opacity-50 disabled:cursor-not-allowed transition-opacity
                "
              >
                {isComputing ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Actualizando…
                  </>
                ) : (
                  '↻ Actualizar análisis'
                )}
              </button>
            </div>

            {/* Sección 1: Confianza del perfil */}
            <Section title="Confianza del análisis" icon="🎯">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-bold border ${confidenceColor(profile.data_confidence)}`}>
                  {confidenceLabel(profile.data_confidence)}
                </span>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  {confidenceDesc(profile.data_confidence, profile.total_eventos)}
                </p>
              </div>
            </Section>

            {/* Sección 2: Resumen IA */}
            {(summary || isComputing) && (
              <Section title="Resumen general" icon="✍️">
                {isComputing ? (
                  <p className="text-sm text-[var(--color-muted-foreground)] italic">Generando análisis…</p>
                ) : summary ? (
                  <p className="text-sm text-[var(--color-foreground)] leading-relaxed">{summary}</p>
                ) : null}
              </Section>
            )}

            {/* Sección 3: Estilo de aprendizaje */}
            <Section title="Estilo de aprendizaje" icon="🧠">
              <p className="text-base font-semibold text-[var(--color-ai-text)]">
                {styleLabel(profile.learning_style)}
              </p>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                {styleDesc(profile.learning_style)}
              </p>
            </Section>

            {/* Sección 4 + 5: Horario y duración */}
            <div className="grid grid-cols-2 gap-4">
              <Section title="Mejor horario" icon="🕐">
                <p className="text-base font-semibold text-[var(--color-ai-text)]">
                  {profile.best_time_range ?? '—'}
                </p>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {profile.best_time_range
                    ? 'Franja con mayor precisión en ejercicios'
                    : 'Necesita más sesiones en distintos horarios'}
                </p>
              </Section>

              <Section title="Duración óptima" icon="⏱️">
                <p className="text-base font-semibold text-[var(--color-ai-text)]">
                  {sessionLabel(profile.session_preference)}
                </p>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {sessionTip(profile.session_preference)}
                </p>
              </Section>
            </div>

            {/* Sección 6: Fortalezas */}
            <Section title="Fortalezas" icon="⭐">
              <TagList
                items={profile.strengths}
                emptyText="Aún no hay áreas con rendimiento destacado. Sigue practicando."
                color="bg-emerald-50 text-emerald-800 border-emerald-200"
              />
            </Section>

            {/* Sección 7: Áreas en desarrollo */}
            <Section title="Áreas en desarrollo" icon="📈">
              <TagList
                items={profile.difficulties}
                emptyText="No se han detectado dificultades persistentes. ¡Buen trabajo!"
                color="bg-amber-50 text-amber-800 border-amber-200"
              />
            </Section>

            {/* Sección 8: Bloqueos detectados */}
            <Section title="Bloqueos detectados" icon="⚠️">
              <TagList
                items={profile.bloqueo_detectado}
                emptyText="No se detectaron bloqueos. El progreso fluye bien."
                color="bg-red-50 text-red-700 border-red-200"
              />
              {profile.bloqueo_detectado.length > 0 && (
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  En estas áreas el estudiante se atasca frecuentemente (3 o más errores seguidos en múltiples sesiones).
                  El tutor IA se activa automáticamente para brindar apoyo.
                </p>
              )}
            </Section>

            {/* Sección 9: Recomendaciones */}
            {(recommendations.length > 0 || isComputing) && (
              <Section title="Recomendaciones para padres" icon="💡">
                {isComputing ? (
                  <p className="text-sm text-[var(--color-muted-foreground)] italic">Generando recomendaciones…</p>
                ) : (
                  <ul className="space-y-2">
                    {recommendations.map((rec, i) => (
                      <li key={i} className="flex gap-2 text-sm text-[var(--color-foreground)]">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-[var(--color-ai-dot)] text-white text-xs flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
            )}

            {/* Desactivar / Borrar perfil */}
            <div className="pt-4 border-t border-[var(--color-card-border)] space-y-4">

              {/* — Desactivar (pausa el reporte, conserva datos) */}
              {!showDisableConfirm ? (
                <button
                  onClick={() => setShowDisableConfirm(true)}
                  className="text-xs text-[var(--color-muted-foreground)] underline underline-offset-2"
                >
                  Pausar reporte (mantiene los datos)
                </button>
              ) : (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-3">
                  <p className="text-sm text-amber-800 font-medium">
                    ¿Pausar el reporte de aprendizaje?
                  </p>
                  <p className="text-xs text-amber-700">
                    El historial se conserva. Puedes reactivar el perfil en cualquier momento sin perder datos.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDisable}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 text-white"
                    >
                      Sí, pausar
                    </button>
                    <button
                      onClick={() => setShowDisableConfirm(false)}
                      className="px-4 py-2 rounded-lg text-xs border border-amber-300 text-amber-800"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* — Borrar datos (derecho al olvido) */}
              {!showDeleteConfirm ? (
                <button
                  onClick={() => { setShowDeleteConfirm(true); setDeleteStep(1) }}
                  className="text-xs text-red-500 underline underline-offset-2"
                >
                  Borrar todos los datos de aprendizaje
                </button>
              ) : deleteStep === 1 ? (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 space-y-3">
                  <p className="text-sm text-red-800 font-semibold">
                    ⚠️ Borrar datos — esto no se puede deshacer
                  </p>
                  <p className="text-xs text-red-700">
                    Se eliminarán permanentemente el perfil de aprendizaje, el historial de ejercicios y los chats con el tutor IA de este dispositivo.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteStep(2)}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-red-600 text-white"
                    >
                      Entiendo, continuar
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 rounded-lg text-xs border border-red-200 text-red-800"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-red-100 border-2 border-red-400 p-4 space-y-3">
                  <p className="text-sm text-red-900 font-bold">
                    Confirmación final
                  </p>
                  <p className="text-xs text-red-800">
                    ¿Confirmas que quieres borrar permanentemente todos los datos de aprendizaje de este dispositivo?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-red-700 text-white disabled:opacity-50"
                    >
                      {isDeleting ? 'Borrando...' : 'Sí, borrar todo'}
                    </button>
                    <button
                      onClick={() => { setShowDeleteConfirm(false); setDeleteStep(1) }}
                      className="px-4 py-2 rounded-lg text-xs border border-red-300 text-red-900"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
