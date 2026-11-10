import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/shared/lib/supabaseClient'
import {
  getActiveChildId,
  getDeviceId,
  isProfileEnabled,
  setProfileEnabled,
} from '@/shared/lib/deviceId'
import type { Tables, TablesInsert } from '@/shared/lib/database.types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

export type StoredProfile = Tables<'learning_profile'>

/** Identidad actual: usuario de Supabase Auth (si hay sesión) + niño activo + dispositivo. */
async function getIdentity() {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    session,
    userId: session?.user.id ?? null,
    childId: getActiveChildId(),
    deviceId: getDeviceId(),
  }
}

/**
 * Busca la fila de learning_profile que corresponde a la identidad actual.
 * Con sesión: por child_id (si hay niño activo) o user_id. Respaldo: device_id.
 */
async function fetchProfileRow(): Promise<StoredProfile | null> {
  const { userId, childId, deviceId } = await getIdentity()

  if (userId) {
    let query = supabase.from('learning_profile').select('*')
    query = childId ? query.eq('child_id', childId) : query.eq('user_id', userId)
    const { data, error } = await query
      .order('last_updated', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    if (data) return data as StoredProfile
  }

  const { data, error } = await supabase
    .from('learning_profile')
    .select('*')
    .eq('device_id', deviceId)
    .maybeSingle()
  if (error) throw error
  return (data as StoredProfile | null) ?? null
}

export interface LearningProfileResult {
  profile: StoredProfile | null
  summary: string | null
  recommendations: string[]
  isEnabled: boolean | null
  isLoading: boolean
  isComputing: boolean
  error: string | null
  loadFromDB: () => Promise<void>
  compute: () => Promise<boolean>
  /** Retorna true si el consentimiento quedó guardado en la base. */
  enable: () => Promise<boolean>
  disable: () => Promise<void>
  deleteProfile: () => Promise<void>
}

export function useLearningProfile(): LearningProfileResult {
  const [profile, setProfile] = useState<StoredProfile | null>(null)
  const [summary, setSummary] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isComputing, setIsComputing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadFromDB = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchProfileRow()

      if (!data) {
        // Sin fila todavía: NO se toca lumi_perfil_habilitado. Se usa localStorage como respaldo.
        const local = isProfileEnabled()
        setIsEnabled(local)
        setProfile(null)
      } else {
        // La base manda: sincroniza el respaldo local con lo guardado.
        setProfileEnabled(data.perfil_habilitado)
        setIsEnabled(data.perfil_habilitado)
        setProfile(data.perfil_habilitado ? data : null)
      }
    } catch (err) {
      // Error de red/RLS: se mantiene el valor local sin modificarlo.
      setIsEnabled(isProfileEnabled())
      setError(err instanceof Error ? err.message : 'Error al cargar el perfil')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFromDB()
  }, [loadFromDB])

  const compute = useCallback(async () => {
    setIsComputing(true)
    setError(null)
    try {
      const { session } = await getIdentity()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (session) headers['Authorization'] = `Bearer ${session.access_token}`

      const res = await fetch(`${SUPABASE_URL}/functions/v1/compute-profile`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ device_id: getDeviceId(), child_id: getActiveChildId() }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      if (!data.enabled) {
        setIsEnabled(false)
        setProfile(null)
        setSummary(null)
        setRecommendations([])
        return true
      }

      setIsEnabled(true)
      setProfile(data.profile as StoredProfile)
      setSummary(data.summary ?? null)
      setRecommendations(Array.isArray(data.recommendations) ? data.recommendations : [])
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al calcular el perfil')
      return false
    } finally {
      setIsComputing(false)
    }
  }, [])

  const enable = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      const { userId, childId, deviceId } = await getIdentity()
      const enablePayload: TablesInsert<'learning_profile'> = {
        device_id: deviceId,
        // Solo se envían si existen, para no desasociar una fila ya ligada a un usuario
        ...(userId ? { user_id: userId } : {}),
        ...(childId ? { child_id: childId } : {}),
        perfil_habilitado: true,
        data_confidence: 'baja',
        bloqueo_detectado: [],
        difficulties: [],
        strengths: [],
        total_eventos: 0,
        last_updated: new Date().toISOString(),
      }
      // Known Supabase type-gen incompatibility: cast required (same pattern as Login.tsx)
      const { error: upsertError } = await supabase
        .from('learning_profile')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .upsert(enablePayload as any, { onConflict: 'device_id' })

      if (upsertError) throw upsertError

      setProfileEnabled(true)
      setIsEnabled(true)
      return true
    } catch (err) {
      // No se marca el consentimiento como guardado: el usuario ve el error y puede reintentar.
      setError(
        err instanceof Error
          ? `No pudimos activar el perfil: ${err.message}`
          : 'No pudimos activar el perfil. Intenta de nuevo.'
      )
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const disable = useCallback(async () => {
    setError(null)
    try {
      const { userId, childId, deviceId } = await getIdentity()
      const disablePayload: TablesInsert<'learning_profile'> = {
        device_id: deviceId,
        // Solo se envían si existen, para no desasociar una fila ya ligada a un usuario
        ...(userId ? { user_id: userId } : {}),
        ...(childId ? { child_id: childId } : {}),
        perfil_habilitado: false,
        last_updated: new Date().toISOString(),
      }
      const { error: upsertError } = await supabase
        .from('learning_profile')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .upsert(disablePayload as any, { onConflict: 'device_id' })

      if (upsertError) throw upsertError

      setProfileEnabled(false)
      setIsEnabled(false)
      setProfile(null)
      setSummary(null)
      setRecommendations([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al desactivar el perfil')
    }
  }, [])

  const deleteProfile = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const deviceId = getDeviceId()
      const [r1, r2, r3] = await Promise.all([
        supabase.from('learning_profile').delete().eq('device_id', deviceId),
        supabase.from('learning_events').delete().eq('device_id', deviceId),
        supabase.from('chat_history').delete().eq('device_id', deviceId),
      ])
      if (r1.error) throw r1.error
      if (r2.error) throw r2.error
      if (r3.error) throw r3.error

      setProfileEnabled(false)
      setIsEnabled(false)
      setProfile(null)
      setSummary(null)
      setRecommendations([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al borrar el perfil')
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    profile,
    summary,
    recommendations,
    isEnabled,
    isLoading,
    isComputing,
    error,
    loadFromDB,
    compute,
    enable,
    disable,
    deleteProfile,
  }
}
