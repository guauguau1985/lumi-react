export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chat_history: {
        Row: {
          created_at: string
          device_id: string | null
          errores_al_momento: number | null
          id: string
          message: string
          nivel_al_momento: number | null
          role: 'tutor' | 'niño'
          session_id: string | null
          tema_al_momento: string | null
          trigger_type: 'error_seguido' | 'solicitud_niño' | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          errores_al_momento?: number | null
          id?: string
          message: string
          nivel_al_momento?: number | null
          role: 'tutor' | 'niño'
          session_id?: string | null
          tema_al_momento?: string | null
          trigger_type?: 'error_seguido' | 'solicitud_niño' | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_id?: string | null
          errores_al_momento?: number | null
          id?: string
          message?: string
          nivel_al_momento?: number | null
          role?: 'tutor' | 'niño'
          session_id?: string | null
          tema_al_momento?: string | null
          trigger_type?: 'error_seguido' | 'solicitud_niño' | null
          user_id?: string | null
        }
      }
      child_profiles: {
        Row: {
          created_at: string | null
          edad: number | null
          id: string
          nivel_general: number | null
          nombre: string
          parent_id: string
        }
        Insert: {
          created_at?: string | null
          edad?: number | null
          id?: string
          nivel_general?: number | null
          nombre: string
          parent_id?: string
        }
        Update: {
          created_at?: string | null
          edad?: number | null
          id?: string
          nivel_general?: number | null
          nombre?: string
          parent_id?: string
        }
      }
      learning_events: {
        Row: {
          abandono: boolean
          accuracy: number | null
          attempts: number
          completado: boolean
          created_at: string
          device_id: string
          errores_seguidos: number
          hora_uso: number | null
          id: string
          modulo: 'math' | 'eco' | 'naturales' | 'coder' | 'ai' | null
          nivel: number
          session_id: string
          tiempo_sesion: number | null
          tipo_ejercicio: 'visual' | 'texto' | 'interactivo' | null
          user_id: string | null
          velocidad_respuesta: number | null
        }
        Insert: {
          abandono?: boolean
          accuracy?: number | null
          attempts?: number
          completado?: boolean
          created_at?: string
          device_id: string
          errores_seguidos?: number
          hora_uso?: number | null
          id?: string
          modulo?: 'math' | 'eco' | 'naturales' | 'coder' | 'ai' | null
          nivel?: number
          session_id: string
          tiempo_sesion?: number | null
          tipo_ejercicio?: 'visual' | 'texto' | 'interactivo' | null
          user_id?: string | null
          velocidad_respuesta?: number | null
        }
        Update: {
          abandono?: boolean
          accuracy?: number | null
          attempts?: number
          completado?: boolean
          created_at?: string
          device_id?: string
          errores_seguidos?: number
          hora_uso?: number | null
          id?: string
          modulo?: 'math' | 'eco' | 'naturales' | 'coder' | 'ai' | null
          nivel?: number
          session_id?: string
          tiempo_sesion?: number | null
          tipo_ejercicio?: 'visual' | 'texto' | 'interactivo' | null
          user_id?: string | null
          velocidad_respuesta?: number | null
        }
      }
      learning_profile: {
        Row: {
          best_time_range: string | null
          bloqueo_detectado: string[]
          data_confidence: 'baja' | 'media' | 'alta'
          device_id: string
          difficulties: string[]
          id: string
          last_updated: string
          learning_style: 'visual' | 'texto' | 'interactivo' | 'mixto' | null
          perfil_habilitado: boolean
          session_preference: 'corta' | 'media' | 'larga' | null
          strengths: string[]
          total_eventos: number
          user_id: string | null
        }
        Insert: {
          best_time_range?: string | null
          bloqueo_detectado?: string[]
          data_confidence?: 'baja' | 'media' | 'alta'
          device_id: string
          difficulties?: string[]
          id?: string
          last_updated?: string
          learning_style?: 'visual' | 'texto' | 'interactivo' | 'mixto' | null
          perfil_habilitado?: boolean
          session_preference?: 'corta' | 'media' | 'larga' | null
          strengths?: string[]
          total_eventos?: number
          user_id?: string | null
        }
        Update: {
          best_time_range?: string | null
          bloqueo_detectado?: string[]
          data_confidence?: 'baja' | 'media' | 'alta'
          device_id?: string
          difficulties?: string[]
          id?: string
          last_updated?: string
          learning_style?: 'visual' | 'texto' | 'interactivo' | 'mixto' | null
          perfil_habilitado?: boolean
          session_preference?: 'corta' | 'media' | 'larga' | null
          strengths?: string[]
          total_eventos?: number
          user_id?: string | null
        }
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nombre: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          nombre?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nombre?: string | null
        }
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: Record<never, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
