import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.log('Error registro:', error.message)
    return { data: null, error }
  }

  console.log('Usuario creado:', data)
  return { data, error: null }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.log('Error login:', error.message)
    return { data: null, error }
  }

  console.log('Login correcto:', data)
  return { data, error: null }
}

export const logout = async () => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.log('Error logout:', error.message)
    return { error }
  }

  console.log('Sesión cerrada')
  return { error: null }
}