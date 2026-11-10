const DEVICE_ID_KEY = 'lumi_device_id'
const CONSENT_KEY = 'lumi_perfil_habilitado'

function generateId(): string {
  return crypto.randomUUID()
}

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = generateId()
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

export function getSessionId(): string {
  // Nuevo UUID por sesión (no persiste entre recargas)
  if (!sessionStorage.getItem('lumi_session_id')) {
    sessionStorage.setItem('lumi_session_id', generateId())
  }
  return sessionStorage.getItem('lumi_session_id')!
}

export function isProfileEnabled(): boolean {
  return localStorage.getItem(CONSENT_KEY) === 'true'
}

export function setProfileEnabled(enabled: boolean): void {
  localStorage.setItem(CONSENT_KEY, enabled ? 'true' : 'false')
}

// Perfil de niño activo (tabla child_profiles). La app todavía no tiene selector
// de niño: cuando exista, debe guardar aquí el id con setActiveChildId().
const ACTIVE_CHILD_KEY = 'lumi_active_child_id'
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Retorna el id del niño activo o null si no hay uno válido. */
export function getActiveChildId(): string | null {
  const id = localStorage.getItem(ACTIVE_CHILD_KEY)
  return id && UUID_RE.test(id) ? id : null
}

export function setActiveChildId(id: string | null): void {
  if (id) localStorage.setItem(ACTIVE_CHILD_KEY, id)
  else localStorage.removeItem(ACTIVE_CHILD_KEY)
}
