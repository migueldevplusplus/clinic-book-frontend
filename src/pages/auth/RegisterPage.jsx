import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { errorMessage } from '../../api/client'
import { ROLE_HOME } from '../../lib/constants'
import { todayISO } from '../../lib/format'
import AuthShell from './AuthShell'
import Button from '../../components/ui/Button'
import { Field, Input } from '../../components/ui/Field'
import { InlineError } from '../../components/ui/States'

const EMPTY = { fullName: '', email: '', rawPassword: '', birthDate: '', phoneNumber: '' }

/** Mirrors the constraints on RegisterRequest so the user sees them before the round trip. */
function validate(form) {
  const errors = {}
  if (form.fullName.trim().length < 2) errors.fullName = 'Mínimo 2 caracteres.'
  if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Correo inválido.'
  if (form.rawPassword.length < 8) errors.rawPassword = 'Mínimo 8 caracteres.'
  if (!form.birthDate) errors.birthDate = 'Indica tu fecha de nacimiento.'
  else if (form.birthDate > todayISO()) errors.birthDate = 'La fecha no puede ser futura.'
  if (form.phoneNumber.trim().length < 10) errors.phoneNumber = 'Mínimo 10 caracteres.'
  return errors
}

export default function RegisterPage() {
  const { signup, isAuthenticated, role } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to={ROLE_HOME[role] ?? '/'} replace />

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    try {
      const session = await signup({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        rawPassword: form.rawPassword,
        birthDate: form.birthDate,
        phoneNumber: form.phoneNumber.trim(),
      })
      navigate(ROLE_HOME[session.role] ?? '/', { replace: true })
    } catch (err) {
      setError(errorMessage(err, 'No se pudo crear la cuenta.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Crea tu cuenta"
      subtitle="Regístrate como paciente para agendar tus citas"
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-brand-700 hover:text-brand-800">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <InlineError message={error} />

        <Field label="Nombre completo" error={errors.fullName} required>
          <Input value={form.fullName} onChange={update('fullName')} placeholder="Juan Pérez" autoComplete="name" />
        </Field>

        <Field label="Correo electrónico" error={errors.email} required>
          <Input type="email" value={form.email} onChange={update('email')} placeholder="tu@correo.com" autoComplete="email" />
        </Field>

        <Field label="Contraseña" error={errors.rawPassword} hint="Mínimo 8 caracteres" required>
          <Input type="password" value={form.rawPassword} onChange={update('rawPassword')} placeholder="••••••••" autoComplete="new-password" />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Fecha de nacimiento" error={errors.birthDate} required>
            <Input type="date" value={form.birthDate} onChange={update('birthDate')} max={todayISO()} />
          </Field>

          <Field label="Teléfono" error={errors.phoneNumber} required>
            <Input value={form.phoneNumber} onChange={update('phoneNumber')} placeholder="0412-5551234" autoComplete="tel" />
          </Field>
        </div>

        <Button type="submit" size="lg" loading={submitting} className="w-full">
          {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>
    </AuthShell>
  )
}
