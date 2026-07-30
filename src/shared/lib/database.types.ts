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
        Relationships: []
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
        Relationships: []
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
          modulo: 'math' | 'eco' | 'naturales' | 'coder' | 'ai' | 'tarea' | 'lenguaje' | 'ingles' | 'historia' | 'tecnologia' | null
          nivel: number
          session_id: string
          subject: string | null
          task_id: string | null
          tiempo_sesion: number | null
          tipo_ejercicio: 'visual' | 'texto' | 'interactivo' | null
          topic: string | null
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
          modulo?: 'math' | 'eco' | 'naturales' | 'coder' | 'ai' | 'tarea' | 'lenguaje' | 'ingles' | 'historia' | 'tecnologia' | null
          nivel?: number
          session_id: string
          subject?: string | null
          task_id?: string | null
          tiempo_sesion?: number | null
          tipo_ejercicio?: 'visual' | 'texto' | 'interactivo' | null
          topic?: string | null
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
          modulo?: 'math' | 'eco' | 'naturales' | 'coder' | 'ai' | 'tarea' | 'lenguaje' | 'ingles' | 'historia' | 'tecnologia' | null
          nivel?: number
          session_id?: string
          subject?: string | null
          task_id?: string | null
          tiempo_sesion?: number | null
          tipo_ejercicio?: 'visual' | 'texto' | 'interactivo' | null
          topic?: string | null
          user_id?: string | null
          velocidad_respuesta?: number | null
        }
        Relationships: []
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
        Relationships: []
      }
      family_links: {
        Row: {
          child_id: string
          created_at: string
          id: string
          parent_id: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          parent_id: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          parent_id?: string
        }
        Relationships: []
      }
      gamification_profiles: {
        Row: {
          badges: Json
          coins: number
          last_active_date: string | null
          level: number
          module_progress: Json
          streak_days: number
          updated_at: string
          user_id: string
          xp_total: number
        }
        Insert: {
          badges?: Json
          coins?: number
          last_active_date?: string | null
          level?: number
          module_progress?: Json
          streak_days?: number
          updated_at?: string
          user_id: string
          xp_total?: number
        }
        Update: {
          badges?: Json
          coins?: number
          last_active_date?: string | null
          level?: number
          module_progress?: Json
          streak_days?: number
          updated_at?: string
          user_id?: string
          xp_total?: number
        }
        Relationships: []
      }
      homework_messages: {
        Row: {
          child_id: string
          content: string
          created_at: string
          id: string
          message_kind: 'chat' | 'summary' | 'draft' | 'review' | 'system'
          role: 'student' | 'tutor'
          task_id: string
        }
        Insert: {
          child_id: string
          content: string
          created_at?: string
          id?: string
          message_kind?: 'chat' | 'summary' | 'draft' | 'review' | 'system'
          role: 'student' | 'tutor'
          task_id: string
        }
        Update: {
          child_id?: string
          content?: string
          created_at?: string
          id?: string
          message_kind?: 'chat' | 'summary' | 'draft' | 'review' | 'system'
          role?: 'student' | 'tutor'
          task_id?: string
        }
        Relationships: []
      }
      homework_tasks: {
        Row: {
          checklist: Json
          child_id: string
          completed_at: string | null
          created_at: string
          current_stage: number
          extracted_text: string | null
          file_name: string | null
          file_path: string | null
          file_type: string | null
          grade: '5-basico' | '6-basico' | '7-basico' | '8-basico' | '1-medio'
          id: string
          instructions_summary: string | null
          points_earned: number
          status: 'in_progress' | 'completed' | 'archived'
          subject:
            | 'matematicas'
            | 'ciencias'
            | 'ingles'
            | 'historia'
            | 'lenguaje'
            | 'tecnologia'
            | 'robotica'
            | 'otra'
          title: string
          updated_at: string
        }
        Insert: {
          checklist?: Json
          child_id: string
          completed_at?: string | null
          created_at?: string
          current_stage?: number
          extracted_text?: string | null
          file_name?: string | null
          file_path?: string | null
          file_type?: string | null
          grade: '5-basico' | '6-basico' | '7-basico' | '8-basico' | '1-medio'
          id?: string
          instructions_summary?: string | null
          points_earned?: number
          status?: 'in_progress' | 'completed' | 'archived'
          subject:
            | 'matematicas'
            | 'ciencias'
            | 'ingles'
            | 'historia'
            | 'lenguaje'
            | 'tecnologia'
            | 'robotica'
            | 'otra'
          title?: string
          updated_at?: string
        }
        Update: {
          checklist?: Json
          child_id?: string
          completed_at?: string | null
          created_at?: string
          current_stage?: number
          extracted_text?: string | null
          file_name?: string | null
          file_path?: string | null
          file_type?: string | null
          grade?: '5-basico' | '6-basico' | '7-basico' | '8-basico' | '1-medio'
          id?: string
          instructions_summary?: string | null
          points_earned?: number
          status?: 'in_progress' | 'completed' | 'archived'
          subject?:
            | 'matematicas'
            | 'ciencias'
            | 'ingles'
            | 'historia'
            | 'lenguaje'
            | 'tecnologia'
            | 'robotica'
            | 'otra'
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_sessions: {
        Row: {
          coins_ganados: number
          created_at: string
          device_id: string
          ejercicios: number
          fecha: string
          game_id: string
          id: string
          modulo: string
          precision: number
          user_id: string | null
          xp_ganado: number
        }
        Insert: {
          coins_ganados?: number
          created_at?: string
          device_id: string
          ejercicios?: number
          fecha?: string
          game_id: string
          id?: string
          modulo: string
          precision?: number
          user_id?: string | null
          xp_ganado?: number
        }
        Update: {
          coins_ganados?: number
          created_at?: string
          device_id?: string
          ejercicios?: number
          fecha?: string
          game_id?: string
          id?: string
          modulo?: string
          precision?: number
          user_id?: string | null
          xp_ganado?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_key: 'girl' | 'boy' | null
          created_at: string | null
          email: string
          grade: '5-basico' | '6-basico' | '7-basico' | '8-basico' | '1-medio' | null
          id: string
          nombre: string | null
          parent_email: string | null
          role: 'student' | 'parent'
          updated_at: string
        }
        Insert: {
          avatar_key?: 'girl' | 'boy' | null
          created_at?: string | null
          email: string
          grade?: '5-basico' | '6-basico' | '7-basico' | '8-basico' | '1-medio' | null
          id?: string
          nombre?: string | null
          parent_email?: string | null
          role?: 'student' | 'parent'
          updated_at?: string
        }
        Update: {
          avatar_key?: 'girl' | 'boy' | null
          created_at?: string | null
          email?: string
          grade?: '5-basico' | '6-basico' | '7-basico' | '8-basico' | '1-medio' | null
          id?: string
          nombre?: string | null
          parent_email?: string | null
          role?: 'student' | 'parent'
          updated_at?: string
        }
        Relationships: []
      }
      store_items: {
        Row: {
          activo: boolean
          asset_key: string | null
          created_at: string
          descripcion: string | null
          id: string
          nombre: string
          precio_coins: number
          tipo: 'tema' | 'marco' | 'freeze' | 'titulo'
        }
        Insert: {
          activo?: boolean
          asset_key?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre: string
          precio_coins?: number
          tipo: 'tema' | 'marco' | 'freeze' | 'titulo'
        }
        Update: {
          activo?: boolean
          asset_key?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string
          precio_coins?: number
          tipo?: 'tema' | 'marco' | 'freeze' | 'titulo'
        }
        Relationships: []
      }
      user_purchases: {
        Row: {
          device_id: string
          id: string
          item_id: string
          purchased_at: string
          user_id: string | null
        }
        Insert: {
          device_id: string
          id?: string
          item_id: string
          purchased_at?: string
          user_id?: string | null
        }
        Update: {
          device_id?: string
          id?: string
          item_id?: string
          purchased_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          alias: string | null
          created_at: string
          device_id: string
          dias_meta: number
          freeze_disponibles: number
          habito_configurado: boolean
          id: string
          racha_actual: number
          racha_maxima: number
          ultimo_dia_activo: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          alias?: string | null
          created_at?: string
          device_id: string
          dias_meta?: number
          freeze_disponibles?: number
          habito_configurado?: boolean
          id?: string
          racha_actual?: number
          racha_maxima?: number
          ultimo_dia_activo?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          alias?: string | null
          created_at?: string
          device_id?: string
          dias_meta?: number
          freeze_disponibles?: number
          habito_configurado?: boolean
          id?: string
          racha_actual?: number
          racha_maxima?: number
          ultimo_dia_activo?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      weekly_league: {
        Row: {
          alias: string
          created_at: string
          device_id: string
          id: string
          semana: string
          user_id: string | null
          xp_semanal: number
        }
        Insert: {
          alias: string
          created_at?: string
          device_id: string
          id?: string
          semana: string
          user_id?: string | null
          xp_semanal?: number
        }
        Update: {
          alias?: string
          created_at?: string
          device_id?: string
          id?: string
          semana?: string
          user_id?: string | null
          xp_semanal?: number
        }
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: {
      add_game_rewards: {
        Args: { p_xp: number; p_coins: number; p_module?: string | null }
        Returns: Database['public']['Tables']['gamification_profiles']['Row']
      }
      add_weekly_xp: {
        Args: {
          p_xp: number
          p_alias: string
          p_device_id: string
          p_week: string
        }
        Returns: undefined
      }
      claim_family_links: {
        Args: Record<never, never>
        Returns: number
      }
      increment_xp_semanal: {
        Args: { p_device_id: string; p_semana: string; p_xp: number }
        Returns: undefined
      }
      delete_child_learning_data: {
        Args: { p_child_id: string }
        Returns: undefined
      }
      merge_device_history: {
        Args: { p_device_id: string }
        Returns: undefined
      }
      set_child_learning_enabled: {
        Args: { p_child_id: string; p_enabled: boolean }
        Returns: undefined
      }
    }
    Enums: Record<never, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
