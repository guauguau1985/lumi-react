import { supabase } from '@/shared/lib/supabaseClient'
import { getDeviceId } from '@/shared/lib/deviceId'

const STORAGE_KEY = 'lumi-league-v1'

const ANIMALS = [
  'Tigre',
  'Oso',
  'Zorro',
  'Águila',
  'León',
  'Lobo',
  'Puma',
  'Delfín',
  'Pingüino',
  'Koala',
  'Panda',
  'Jirafa',
  'Cebra',
  'Pulpo',
  'Conejo',
  'Tortuga',
  'Jaguar',
  'Ratón',
  'Pato',
  'Rana',
]

const ADJECTIVES = [
  'Veloz',
  'Astuto',
  'Valiente',
  'Brillante',
  'Rápido',
  'Fuerte',
  'Ágil',
  'Sabio',
  'Audaz',
  'Noble',
  'Curioso',
  'Alegre',
  'Genial',
  'Hábil',
]

interface LeagueLocal {
  alias: string
  joined: boolean
}

function storageKey(userId?: string | null) {
  return userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY
}

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

export function getOrCreateAlias(userId?: string | null) {
  try {
    const saved = localStorage.getItem(storageKey(userId))
    if (saved) {
      const parsed = JSON.parse(saved) as LeagueLocal
      if (parsed.alias) return parsed.alias
    }
  } catch {
    // A fresh anonymous alias is safe if local storage was cleared.
  }
  const alias = `${pick(ANIMALS)}${pick(ADJECTIVES)}`
  saveLeagueLocal({ alias, joined: false }, userId)
  return alias
}

export function loadLeagueLocal(userId?: string | null): LeagueLocal {
  try {
    const saved = localStorage.getItem(storageKey(userId))
    if (saved) return JSON.parse(saved) as LeagueLocal
  } catch {
    // Use defaults below.
  }
  return { alias: getOrCreateAlias(userId), joined: false }
}

export function saveLeagueLocal(data: LeagueLocal, userId?: string | null) {
  localStorage.setItem(storageKey(userId), JSON.stringify(data))
}

export function markLeagueJoined(userId?: string | null) {
  saveLeagueLocal({ ...loadLeagueLocal(userId), joined: true }, userId)
}

export function getSemanaActual() {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const difference = now.getTime() - startOfYear.getTime()
  const week = Math.ceil((difference / 86_400_000 + startOfYear.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`
}

export function msHastaProximoLunes() {
  const now = new Date()
  const day = now.getDay()
  const untilMonday = day === 0 ? 1 : 8 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + untilMonday)
  monday.setHours(0, 0, 0, 0)
  return monday.getTime() - now.getTime()
}

export function addXpSemanal(xp: number, userId?: string | null) {
  if (xp <= 0 || !userId) return
  void supabase
    .rpc('add_weekly_xp', {
      p_xp: xp,
      p_alias: getOrCreateAlias(userId),
      p_device_id: getDeviceId(),
      p_week: getSemanaActual(),
    })
    .then(({ error }) => {
      if (error) console.error('[Lumi] weekly league sync error:', error.message)
    })
}

export interface LeagueEntry {
  id: string
  alias: string
  xp_semanal: number
  device_id: string
  esMio: boolean
}

export async function getTopLeague(userId?: string | null): Promise<LeagueEntry[]> {
  const { data, error } = await supabase
    .from('weekly_league')
    .select('id, alias, xp_semanal, device_id, user_id')
    .eq('semana', getSemanaActual())
    .order('xp_semanal', { ascending: false })
    .limit(20)
  if (error || !data) return []

  return data.map((row) => ({
    id: row.id,
    alias: row.alias,
    xp_semanal: row.xp_semanal,
    device_id: row.device_id,
    esMio: Boolean(userId && row.user_id === userId),
  }))
}
