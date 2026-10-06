import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import {
  dueReviews,
  forgivingStreak,
  loadActivityDays,
  loadProgress,
  loadReviews,
  loadSettings,
  type ProLessonProgress,
  type ProReview,
  type ProSettings,
} from '@/modules/pro/lib/proStore'

interface ProContextValue {
  userId: string
  isLoading: boolean
  error: string
  settings: ProSettings | null
  progress: ProLessonProgress[]
  reviews: ProReview[]
  due: ProReview[]
  streak: number
  minutesSaved: number
  refresh: () => Promise<void>
}

const ProContext = createContext<ProContextValue | null>(null)

export function ProProvider({ userId, children }: PropsWithChildren<{ userId: string }>) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [settings, setSettings] = useState<ProSettings | null>(null)
  const [progress, setProgress] = useState<ProLessonProgress[]>([])
  const [reviews, setReviews] = useState<ProReview[]>([])
  const [activityDays, setActivityDays] = useState<string[]>([])

  const refresh = useCallback(async () => {
    try {
      const [nextSettings, nextProgress, nextReviews, nextDays] = await Promise.all([
        loadSettings(userId),
        loadProgress(userId),
        loadReviews(userId),
        loadActivityDays(userId),
      ])
      setSettings(nextSettings)
      setProgress(nextProgress)
      setReviews(nextReviews)
      setActivityDays(nextDays)
      setError('')
    } catch (cause) {
      console.error('[Lumi Pro] No se pudo cargar el avance:', cause)
      setError('No pudimos cargar tu avance. Revisa tu conexión e intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo<ProContextValue>(
    () => ({
      userId,
      isLoading,
      error,
      settings,
      progress,
      reviews,
      due: dueReviews(reviews),
      streak: forgivingStreak(activityDays),
      minutesSaved: progress.reduce((total, row) => total + (row.minutes_saved ?? 0), 0),
      refresh,
    }),
    [userId, isLoading, error, settings, progress, reviews, activityDays, refresh]
  )

  return <ProContext.Provider value={value}>{children}</ProContext.Provider>
}

export function usePro() {
  const value = useContext(ProContext)
  if (!value) throw new Error('usePro debe usarse dentro de ProProvider')
  return value
}
