import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/shared/lib/supabaseClient'
import { getDeviceId, setProfileEnabled } from '@/shared/lib/deviceId'
import type { Tables, TablesInsert } from '@/shared/lib/database.types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

export type StoredProfile = Tables<'learning_profile'>

export interface LearningProfileResult {
  profile: StoredProfile | null
  summary: string | null
  recommendations: string[]
  isEnabled: boolean | null
  isLoading: boolean
  isComputing: boolean
  error: string | null
  loadFromDB: () => Promise<void>
  compute: () => Promise<void>
  enable: () => Promise<void>
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
      const { data: rawData, error: dbError } = await supabase
        .from('learning_profile')
        .select('*')
        .eq('device_id', getDeviceId())
        .maybeSingle()
      const data = rawData as StoredProfile | null

      if (dbError) throw dbError

      if (!data) {
        setProfileEnabled(false)
        setIsEnabled(false)
        setProfile(null)
      } else {
        setProfileEnabled(data.perfil_habilitado)
        setIsEnabled(data.perfil_habilitado)
        setProfile(data.perfil_habilitado ? data : null)
      }
    } catch (err) {
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
      const { data: { session } } = await supabase.auth.getSession()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (session) headers['Authorization'] = `Bearer ${session.access_token}`

      const res = await fetch(`${SUPABASE_URL}/functions/v1/compute-profile`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ device_id: getDeviceId() }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      if (!data.enabled) {
        setIsEnabled(false)
        setProfile(null)
        setSummary(null)
        setRecommendations([])
        return
      }

      setIsEnabled(true)
      setProfile(data.profile as StoredProfile)
      setSummary(data.summary ?? null)
      setRecommendations(Array.isArray(data.recommendations) ? data.recommendations : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al calcular el perfil')
    } finally {
      setIsComputing(false)
    }
  }, [])

  const enable = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const enablePayload: TablesInsert<'learning_profile'> = {
        device_id: getDeviceId(),
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al activar el perfil')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const disable = useCallback(async () => {
    setError(null)
    try {
      const disablePayload: TablesInsert<'learning_profile'> = {
        device_id: getDeviceId(),
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
