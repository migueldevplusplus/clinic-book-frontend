import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { disableUser, listUsers, registerReceptionist } from '../../api/auth'
import { registerDoctor } from '../../api/doctors'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../context/AuthContext'
import { errorMessage } from '../../api/client'
import { ROLE_LABELS, SPECIALTIES } from '../../lib/constants'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Field, Input, Select } from '../../components/ui/Field'
import {
  EmptyState, ErrorState, InlineError, InlineSuccess, LoadingRows,
} from '../../components/ui/States'
import {
  ClipboardIcon, PlusIcon, ShieldIcon, StethoscopeIcon, UsersIcon,
} from '../../components/ui/Icons'

const ROLE_STYLES = {
  SUPER_ADMIN: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  DOCTOR: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  RECEPTIONIST: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  PATIENT: 'bg-ink-100 text-ink-600 ring-ink-500/20',
}

const EMPTY_DOCTOR = {
  fullName: '', email: '', rawPassword: '',
  specialty: 'GENERAL_MEDICINE', consultationDurationMinutes: '30',
}
const EMPTY_STAFF = { fullName: '', email: '', rawPassword: '' }

function validateCommon(form) {
  const errors = {}
  if (form.fullName.trim().length < 2) errors.fullName = 'Mínimo 2 caracteres.'
  if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Correo inválido.'
  if (form.rawPassword.length < 8) errors.rawPassword = 'Mínimo 8 caracteres.'
  return errors
}

export default function AdminPage() {
  const { user } = useAuth()
  const { data, loading, error, reload } = useAsync(listUsers, [], { initialData: [] })

  const [roleFilter, setRoleFilter] = useState('')
  const [notice, setNotice] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [toDisable, setToDisable] = useState(null)

  const [creating, setCreating] = useState(null) // 'DOCTOR' | 'RECEPTIONIST' | null
  const [form, setForm] = useState(EMPTY_DOCTOR)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)

  const users = useMemo(() => {
    const list = [...(data ?? [])].sort((a, b) => a.fullName.localeCompare(b.fullName))
    return roleFilter ? list.filter((u) => u.role === roleFilter) : list
  }, [data, roleFilter])

  const openCreate = (role) => {
    setCreating(role)
    setForm(role === 'DOCTOR' ? EMPTY_DOCTOR : EMPTY_STAFF)
    setErrors({})
    setFormError(null)
  }

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError(null)

    const found = validateCommon(form)
    if (creating === 'DOCTOR') {
      const minutes = Number(form.consultationDurationMinutes)
      if (!Number.isFinite(minutes) || minutes <= 0) {
        found.consultationDurationMinutes = 'Debe ser un número mayor que 0.'
      }
    }
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSaving(true)
    try {
      if (creating === 'DOCTOR') {
        await registerDoctor({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          rawPassword: form.rawPassword,
          specialty: form.specialty,
          consultationDurationMinutes: Number(form.consultationDurationMinutes),
        })
        setNotice('Doctor registrado correctamente.')
      } else {
        await registerReceptionist({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          rawPassword: form.rawPassword,
        })
        setNotice('Recepcionista registrado correctamente.')
      }
      setCreating(null)
      await reload()
    } catch (err) {
      setFormError(errorMessage(err, 'No se pudo completar el registro.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDisable = async () => {
    setActionError(null)
    setBusyId(toDisable.userId)
    try {
      await disableUser(toDisable.userId)
      setToDisable(null)
      setNotice('El usuario fue desactivado.')
      await reload()
    } catch (err) {
      setActionError(errorMessage(err, 'No se pudo desactivar al usuario.'))
    } finally {
      setBusyId(null)
    }
  }

  const isDoctorForm = creating === 'DOCTOR'

  return (
    <>
      <PageHeader
        title="Administración"
        subtitle="Gestiona el personal y las cuentas del sistema"
        actions={
          <>
            <Button size="sm" onClick={() => openCreate('DOCTOR')}>
              <PlusIcon className="h-4 w-4" />
              Registrar doctor
            </Button>
            <Button variant="secondary" size="sm" onClick={() => openCreate('RECEPTIONIST')}>
              <PlusIcon className="h-4 w-4" />
              Registrar recepcionista
            </Button>
          </>
        }
      />

      {notice && (
        <div className="mb-5">
          <InlineSuccess message={notice} />
        </div>
      )}
      {actionError && (
        <div className="mb-5">
          <InlineError message={actionError} />
        </div>
      )}

      <div className="card mb-6 p-4 sm:max-w-xs">
        <Field label="Filtrar por rol">
          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">Todos los roles</option>
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </Field>
      </div>

      {loading && <LoadingRows rows={5} />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && users.length === 0 && (
        <EmptyState
          icon={UsersIcon}
          title="No hay usuarios que mostrar"
          message={roleFilter ? 'Ningún usuario tiene ese rol.' : 'Aún no hay usuarios registrados.'}
        />
      )}

      {!loading && !error && users.length > 0 && (
        <ul className="space-y-3">
          {users.map((entry) => {
            const isSelf = entry.userId === user?.userId
            return (
              <li key={entry.userId} className="card flex flex-wrap items-center gap-x-4 gap-y-3 p-4">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    entry.role === 'DOCTOR'
                      ? 'bg-brand-50 text-brand-700'
                      : entry.role === 'SUPER_ADMIN'
                        ? 'bg-purple-50 text-purple-700'
                        : 'bg-ink-100 text-ink-500'
                  }`}
                >
                  {entry.role === 'DOCTOR' ? (
                    <StethoscopeIcon />
                  ) : entry.role === 'SUPER_ADMIN' ? (
                    <ShieldIcon />
                  ) : (
                    <UsersIcon />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink-900">
                    {entry.fullName}
                    {isSelf && <span className="ml-2 text-xs font-normal text-ink-400">(tú)</span>}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-500">
                    {entry.active ? 'Cuenta activa' : 'Cuenta desactivada'}
                  </p>
                </div>

                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                    ROLE_STYLES[entry.role] ?? ROLE_STYLES.PATIENT
                  }`}
                >
                  {ROLE_LABELS[entry.role] ?? entry.role}
                </span>

                {/* A doctor's id is their user id, so the schedule page opens
                    straight onto this row's doctor. */}
                {entry.role === 'DOCTOR' && (
                  <Link to={`/staff/doctor-schedules?doctorId=${entry.userId}`}>
                    <Button variant="secondary" size="sm">
                      <ClipboardIcon className="h-4 w-4" />
                      Horarios
                    </Button>
                  </Link>
                )}

                {entry.active ? (
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={isSelf}
                    title={isSelf ? 'No puedes desactivar tu propia cuenta' : undefined}
                    loading={busyId === entry.userId}
                    onClick={() => { setToDisable(entry); setActionError(null) }}
                  >
                    Desactivar
                  </Button>
                ) : (
                  <span className="text-xs font-medium text-ink-400">Desactivado</span>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {/* Register doctor / receptionist */}
      <Modal
        open={Boolean(creating)}
        onClose={() => !saving && setCreating(null)}
        title={isDoctorForm ? 'Registrar doctor' : 'Registrar recepcionista'}
        description="Se creará una cuenta con la que podrá iniciar sesión."
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreating(null)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" form="staff-form" loading={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </>
        }
      >
        <form id="staff-form" onSubmit={handleCreate} className="space-y-4" noValidate>
          <InlineError message={formError} />

          <Field label="Nombre completo" error={errors.fullName} required>
            <Input value={form.fullName} onChange={update('fullName')} placeholder="Ana García" />
          </Field>

          <Field label="Correo electrónico" error={errors.email} required>
            <Input type="email" value={form.email} onChange={update('email')} placeholder="ana@clinicbook.com" />
          </Field>

          <Field label="Contraseña" error={errors.rawPassword} hint="Mínimo 8 caracteres" required>
            <Input type="password" value={form.rawPassword} onChange={update('rawPassword')} />
          </Field>

          {isDoctorForm && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Especialidad" required>
                <Select value={form.specialty} onChange={update('specialty')}>
                  {SPECIALTIES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </Select>
              </Field>

              <Field
                label="Duración (min)"
                error={errors.consultationDurationMinutes}
                required
              >
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={form.consultationDurationMinutes}
                  onChange={update('consultationDurationMinutes')}
                />
              </Field>
            </div>
          )}
        </form>
      </Modal>

      {/* Disable confirmation */}
      <Modal
        open={Boolean(toDisable)}
        onClose={() => !busyId && setToDisable(null)}
        title="Desactivar usuario"
        description="No podrá volver a iniciar sesión."
        footer={
          <>
            <Button variant="secondary" onClick={() => setToDisable(null)} disabled={Boolean(busyId)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDisable} loading={Boolean(busyId)}>
              Desactivar
            </Button>
          </>
        }
      >
        {toDisable && (
          <p className="mt-1 text-sm text-ink-600">
            ¿Seguro que quieres desactivar la cuenta de{' '}
            <span className="font-medium text-ink-900">{toDisable.fullName}</span>
            {' '}({ROLE_LABELS[toDisable.role] ?? toDisable.role})?
          </p>
        )}
      </Modal>
    </>
  )
}
