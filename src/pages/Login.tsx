import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp } from '@/lib/supabaseClient'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState<'signup' | 'signin' | null>(null)

  const validateFields = () => {
    if (!email.trim() || !password.trim()) {
      const message = 'Email y password son obligatorios.'
      setErrorMessage(message)
      console.log(message)
      return false
    }

    return true
  }

  const handleSignUp = async () => {
    if (loading) return
    if (!validateFields()) return

    setErrorMessage('')
    setLoading('signup')
    const { data, error } = await signUp(email, password)
    setLoading(null)

    if (error) {
      setErrorMessage(error.message)
      console.log('Error al registrarse:', error.message)
      return
    }

    console.log('Registro exitoso:', data)
  }

  const handleSignIn = async () => {
    if (loading) return
    if (!validateFields()) return

    setErrorMessage('')
    setLoading('signin')
    const { data, error } = await signIn(email, password)
    setLoading(null)

    if (error) {
      setErrorMessage(error.message)
      console.log('Error al iniciar sesión:', error.message)
      return
    }

    console.log('Inicio de sesión exitoso:', data)
    navigate('/')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <section className="w-full max-w-sm rounded-lg bg-white p-6 shadow">
        <h1 className="mb-6 text-center text-2xl font-semibold text-slate-800">
          Login
        </h1>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={loading !== null}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={loading !== null}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />

          {errorMessage ? (
            <p className="text-sm text-red-600">{errorMessage}</p>
          ) : null}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading !== null}
              className="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading === 'signup' ? 'Cargando...' : 'Registrarse'}
            </button>

            <button
              type="button"
              onClick={handleSignIn}
              disabled={loading !== null}
              className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading === 'signin' ? 'Cargando...' : 'Iniciar sesión'}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Login
