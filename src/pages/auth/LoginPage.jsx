import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { errorMessage } from '../../api/client'
import { ROLE_HOME } from '../../lib/constants'
import AuthShell from './AuthShell'
import Button from '../../components/ui/Button'
import { Field, Input } from '../../components/ui/Field'
import { InlineError } from '../../components/ui/States'

export default function LoginPage() {
  const { login, isAuthenticated, role } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to={ROLE_HOME[role] ?? '/'} replace />

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const session = await login(form.email.trim(), form.password)
      navigate(ROLE_HOME[session.role] ?? '/', { replace: true })
    } catch (err) {
      setError(errorMessage(err, 'No se pudo iniciar sesión.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Inicia sesión"
      subtitle="Ingresa tus credenciales para continuar"
      footer={
        <>
          ¿Paciente nuevo?{' '}
          <Link to="/register" className="font-medium text-brand-700 hover:text-brand-800">
            Regístrate
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <InlineError message={error} />

        <Field label="Correo electrónico" required>
          <Input
            type="email"
            value={form.email}
            onChange={update('email')}
            placeholder="tu@correo.com"
            autoComplete="email"
            required
          />
        </Field>

        <Field label="Contraseña" required>
          <Input
            type="password"
            value={form.password}
            onChange={update('password')}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </Field>

        <Button type="submit" size="lg" loading={submitting} className="w-full">
          {submitting ? 'Entrando…' : 'Iniciar sesión'}
        </Button>
      </form>
    </AuthShell>
  )
}
