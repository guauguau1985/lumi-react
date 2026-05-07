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
