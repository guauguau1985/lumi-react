import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/shared/lib/supabaseClient'
import { getDeviceId } from '@/shared/lib/deviceId'
import type { Tables } from '@/shared/lib/database.types'

export type LumiProfile = Tables<'profiles'>

interface AuthContextValue {
  session: Session | null
  profile: LumiProfile | null
  isLoading: boolean
  refreshProfile: () => Promise<LumiProfile | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function loadProfile(userId: string): Promise<LumiProfile | null> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (data) return data
    if (error && error.code !== 'PGRST116') throw error
    await new Promise((resolve) => window.setTimeout(resolve, 250 * (attempt + 1)))
  }
  return null
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<LumiProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession()
    const userId = currentSession?.user.id ?? session?.user.id
    if (!userId) {
      setProfile(null)
      return null
    }
    const next = await loadProfile(userId)
    setProfile(next)
    return next
  }, [session?.user.id])

  useEffect(() => {
    let active = true

    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession()
      if (!active) return
      setSession(data.session)
      if (data.session?.user.id) {
        try {
          const next = await loadProfile(data.session.user.id)
          if (active) setProfile(next)
          await supabase.rpc('merge_device_history', { p_device_id: getDeviceId() })
        } catch (error) {
          console.error('[Lumi] No se pudo cargar el perfil:', error)
        }
      }
      if (active) setIsLoading(false)
    }

    void bootstrap()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!active) return
        setSession(nextSession)
        setIsLoading(true)

        // Supabase holds an internal auth lock while this callback runs. Defer all
        // database work so reloads and tab restores cannot deadlock that lock.
        window.setTimeout(() => {
          void (async () => {
            if (!active) return
            if (nextSession?.user.id) {
              try {
                const next = await loadProfile(nextSession.user.id)
                if (active) setProfile(next)
                await supabase.rpc('merge_device_history', {
                  p_device_id: getDeviceId(),
                })
              } catch (error) {
                console.error('[Lumi] No se pudo sincronizar el perfil:', error)
              }
            } else {
              setProfile(null)
            }
            if (active) setIsLoading(false)
          })()
        }, 0)
      }
    )

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }, [])

  const value = useMemo(
    () => ({ session, profile, isLoading, refreshProfile, signOut }),
    [session, profile, isLoading, refreshProfile, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return value
}
