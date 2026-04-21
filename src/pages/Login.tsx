import { type FormEvent, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp, supabase } from '@/lib/supabaseClient'

const Login = () => {
  const navigate = useNavigate()
  const formRef = useRef<HTMLFormElement>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState<'signup' | 'signin' | null>(null)

  const getReadableAuthError = (message: string) => {
    const normalized = message.toLowerCase()

    if (normalized.includes('invalid login credentials')) {
      return 'Credenciales inválidas. Si es un correo nuevo, primero regístrate.'
    }

    if (normalized.includes('email not confirmed')) {
      return 'Debes confirmar tu correo antes de iniciar sesión.'
    }

    if (
      normalized.includes('rate limit') ||
      normalized.includes('too many requests') ||
      normalized.includes('too many') ||
      normalized.includes('over_email_send_rate_limit')
    ) {
      return 'Demasiados intentos en poco tiempo. Espera unos minutos antes de volver a intentar.'
    }

    return message
  }

  const validateFields = (safeEmail: string, safePassword: string) => {
    if (!safeEmail || !safePassword) {
      const message = 'Email y password son obligatorios.'
      setErrorMessage(message)
      console.log(message)
      return false
    }

    return true
  }

  const getCredentialsFromForm = () => {
    const formData = formRef.current ? new FormData(formRef.current) : null
    const safeEmail = String(formData?.get('email') ?? '').trim()
    const safePassword = String(formData?.get('password') ?? '').trim()
    return { safeEmail, safePassword }
  }

  const handleSignUp = async (safeEmail: string, safePassword: string) => {
    if (loading) return
    if (!validateFields(safeEmail, safePassword)) return

    setErrorMessage('')
    setSuccessMessage('')
    setLoading('signup')
    const { data, error } = await signUp(safeEmail, safePassword)

    if (error) {
      const readableMessage = getReadableAuthError(error.message)
      setErrorMessage(readableMessage)
      console.log('Error al registrarse:', error.message)
      setLoading(null)
      return
    }

    console.log('Registro exitoso:', data)
    setSuccessMessage(
      'Te enviamos un correo para confirmar tu cuenta. Revisa tu bandeja de entrada.'
    )
    setLoading(null)
  }

  const handleSignIn = async (safeEmail: string, safePassword: string) => {
    if (loading) return
    if (!validateFields(safeEmail, safePassword)) return

    setErrorMessage('')
    setSuccessMessage('')
    setLoading('signin')
    const { data, error } = await signIn(safeEmail, safePassword)
    setLoading(null)

    if (error) {
      const readableMessage = getReadableAuthError(error.message)
      setErrorMessage(readableMessage)
      console.log('Error al iniciar sesión:', error.message)
      setLoading(null)
      return
    }

    const userId = data?.user?.id
    const userEmail = data?.user?.email

    if (!userId || !userEmail) {
      const message = 'No se pudo obtener la información del usuario para guardar el perfil.'
      setErrorMessage(message)
      console.log('Error al guardar perfil:', message)
      setLoading(null)
      return
    }

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      email: userEmail,
      nombre: null,
    })

    if (profileError) {
      setErrorMessage(profileError.message)
      console.log('Error al guardar perfil:', profileError.message)
      setLoading(null)
      return
    }

    console.log('Inicio de sesión exitoso:', data)
    setLoading(null)
    navigate('/')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loading) return

    const submitter = (
      event.nativeEvent as SubmitEvent
    ).submitter as HTMLButtonElement | null
    const action = submitter?.value as 'signup' | 'signin' | undefined
    const { safeEmail, safePassword } = getCredentialsFromForm()

    if (action === 'signup') {
      await handleSignUp(safeEmail, safePassword)
      return
    }

    await handleSignIn(safeEmail, safePassword)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <section className="w-full max-w-sm rounded-lg bg-white p-6 shadow">
        <h1 className="mb-6 text-center text-2xl font-semibold text-slate-800">
          Login
        </h1>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={() => {
              if (errorMessage) setErrorMessage('')
              if (successMessage) setSuccessMessage('')
            }}
            autoComplete="email"
            disabled={loading !== null}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={() => {
              if (errorMessage) setErrorMessage('')
              if (successMessage) setSuccessMessage('')
            }}
            autoComplete="current-password"
            disabled={loading !== null}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />

          {errorMessage ? (
            <p className="text-sm text-red-600">{errorMessage}</p>
          ) : null}
          {successMessage ? (
            <p className="text-sm text-emerald-700">{successMessage}</p>
          ) : null}

          <div className="flex gap-2">
            <button
              type="submit"
              value="signup"
              disabled={loading !== null}
              className="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading === 'signup' ? 'Cargando...' : 'Registrarse'}
            </button>

            <button
              type="submit"
              value="signin"
              disabled={loading !== null}
              className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading === 'signin' ? 'Cargando...' : 'Iniciar sesión'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

export default Login
