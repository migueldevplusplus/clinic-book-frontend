import { useState } from 'react'
import { registerPatient, searchPatients } from '../../api/patients'
import { useAsync } from '../../hooks/useAsync'
import { useDebounced } from '../../hooks/useDebounced'
import { errorMessage } from '../../api/client'
import { todayISO } from '../../lib/format'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Field, Input } from '../../components/ui/Field'
import { InlineError } from '../../components/ui/States'
import { CheckIcon, PlusIcon, SearchIcon, UserIcon, XIcon } from '../../components/ui/Icons'

const EMPTY_PATIENT = {
  fullName: '', email: '', rawPassword: '', birthDate: '', phoneNumber: '',
}

/** Mirrors RegisterRequest, so the receptionist sees the rules up front. */
function validate(form) {
  const errors = {}
  if (form.fullName.trim().length < 2) errors.fullName = 'Mínimo 2 caracteres.'
  if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Correo inválido.'
  if (form.rawPassword.length < 8) errors.rawPassword = 'Mínimo 8 caracteres.'
  if (!form.birthDate) errors.birthDate = 'Indica la fecha de nacimiento.'
  if (form.phoneNumber.trim().length < 10) errors.phoneNumber = 'Mínimo 10 caracteres.'
  return errors
}

/**
 * Turns a typed name into a patientId. The id is never shown; it is held in
 * state and handed to the caller through onSelect.
 */
export default function PatientPicker({ selected, onSelect }) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounced(query)
  const term = debouncedQuery.trim()

  const { data, loading, error } = useAsync(
    () => searchPatients(term),
    [term],
    { skip: term.length < 2, initialData: [] },
  )

  const [registering, setRegistering] = useState(false)
  const [form, setForm] = useState(EMPTY_PATIENT)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)

  const results = term.length >= 2 ? (data ?? []) : []

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const openRegister = () => {
    // Carry over whatever was typed, it is usually the patient's name.
    setForm({ ...EMPTY_PATIENT, fullName: query.trim() })
    setErrors({})
    setFormError(null)
    setRegistering(true)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setFormError(null)
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSaving(true)
    try {
      const created = await registerPatient({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        rawPassword: form.rawPassword,
        birthDate: form.birthDate,
        phoneNumber: form.phoneNumber.trim(),
      })
      // The response gives back the id, so the new patient can be booked at once.
      onSelect({
        patientId: created.userId,
        fullName: created.fullName ?? form.fullName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
      })
      setRegistering(false)
      setQuery('')
    } catch (err) {
      setFormError(errorMessage(err, 'No se pudo registrar al paciente.'))
    } finally {
      setSaving(false)
    }
  }

  if (selected) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 p-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
          <CheckIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink-900">{selected.fullName}</p>
          <p className="truncate text-sm text-ink-500">{selected.email}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onSelect(null)}>
          <XIcon className="h-4 w-4" />
          Cambiar
        </Button>
      </div>
    )
  }

  return (
    <>
      <Field label="Paciente" required>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o correo…"
            className="pl-9"
            autoComplete="off"
          />
        </div>
      </Field>

      {term.length >= 2 && (
        <div className="mt-2 overflow-hidden rounded-xl border border-ink-200">
          {loading && <p className="px-3.5 py-3 text-sm text-ink-500">Buscando…</p>}

          {!loading && error && (
            <p className="px-3.5 py-3 text-sm text-red-600">{error}</p>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-3">
              <p className="text-sm text-ink-500">Ningún paciente coincide.</p>
              <Button variant="secondary" size="sm" onClick={openRegister}>
                <PlusIcon className="h-4 w-4" />
                Registrar paciente
              </Button>
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <ul className="max-h-64 divide-y divide-ink-100 overflow-y-auto">
              {results.map((patient) => (
                <li key={patient.patientId}>
                  <button
                    type="button"
                    onClick={() => onSelect(patient)}
                    className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition hover:bg-brand-50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-500">
                      <UserIcon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink-900">
                        {patient.fullName}
                      </span>
                      <span className="block truncate text-xs text-ink-500">
                        {patient.email}
                        {patient.phoneNumber && ` · ${patient.phoneNumber}`}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {term.length > 0 && term.length < 2 && (
        <p className="mt-1.5 text-xs text-ink-500">Escribe al menos 2 caracteres.</p>
      )}

      {term.length >= 2 && results.length > 0 && (
        <button
          type="button"
          onClick={openRegister}
          className="mt-2 text-sm font-medium text-brand-700 transition hover:text-brand-800"
        >
          ¿No aparece? Registrar paciente nuevo
        </button>
      )}

      <Modal
        open={registering}
        onClose={() => !saving && setRegistering(false)}
        title="Registrar paciente"
        description="Se creará una cuenta con la que el paciente podrá entrar."
        footer={
          <>
            <Button variant="secondary" onClick={() => setRegistering(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" form="patient-form" loading={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </>
        }
      >
        <form id="patient-form" onSubmit={handleRegister} className="space-y-4" noValidate>
          <InlineError message={formError} />

          <Field label="Nombre completo" error={errors.fullName} required>
            <Input value={form.fullName} onChange={update('fullName')} placeholder="María López" />
          </Field>

          <Field label="Correo electrónico" error={errors.email} required>
            <Input type="email" value={form.email} onChange={update('email')} placeholder="maria@correo.com" />
          </Field>

          <Field
            label="Contraseña"
            error={errors.rawPassword}
            hint="Mínimo 8 caracteres. El paciente podrá cambiarla luego."
            required
          >
            <Input type="password" value={form.rawPassword} onChange={update('rawPassword')} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Fecha de nacimiento" error={errors.birthDate} required>
              <Input type="date" value={form.birthDate} onChange={update('birthDate')} max={todayISO()} />
            </Field>
            <Field label="Teléfono" error={errors.phoneNumber} required>
              <Input value={form.phoneNumber} onChange={update('phoneNumber')} placeholder="0412-5551234" />
            </Field>
          </div>
        </form>
      </Modal>
    </>
  )
}
