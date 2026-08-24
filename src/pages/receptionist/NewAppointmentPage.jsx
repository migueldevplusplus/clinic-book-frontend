import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { bookAsReceptionist, getAvailability } from '../../api/appointments'
import { listDoctors } from '../../api/doctors'
import { useAsync } from '../../hooks/useAsync'
import { errorMessage } from '../../api/client'
import { specialtyLabel } from '../../lib/constants'
import { addMinutes, formatTime, todayISO, toBackendTime } from '../../lib/format'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import { Field, Input, Select } from '../../components/ui/Field'
import { InlineError } from '../../components/ui/States'
import PatientPicker from './PatientPicker'
import { ChevronLeftIcon } from '../../components/ui/Icons'

function Step({ number, title, children }) {
  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-900 text-xs font-semibold text-white">
          {number}
        </span>
        <h2 className="font-semibold text-ink-900">{title}</h2>
      </div>
      {children}
    </section>
  )
}

export default function NewAppointmentPage() {
  const navigate = useNavigate()

  const [patient, setPatient] = useState(null)
  const [doctorId, setDoctorId] = useState('')
  const [date, setDate] = useState(todayISO())
  const [slot, setSlot] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const doctorsQuery = useAsync(() => listDoctors(), [], { initialData: [] })
  const doctors = doctorsQuery.data ?? []
  const doctor = doctors.find((d) => d.doctorId === doctorId)

  const slotsQuery = useAsync(
    () => getAvailability(doctorId, date),
    [doctorId, date],
    { skip: !doctorId || !date, initialData: [] },
  )

  const slots = useMemo(() => slotsQuery.data ?? [], [slotsQuery.data])
  const duration = doctor?.consultationDurationMinutes ?? 30
  const endTime = slot ? addMinutes(slot, duration) : null

  // Changing doctor or date invalidates whatever slot was picked.
  const changeDoctor = (value) => { setDoctorId(value); setSlot(null) }
  const changeDate = (value) => { setDate(value); setSlot(null) }

  const canSubmit = patient && doctorId && date && slot && !submitting

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      await bookAsReceptionist({
        patientId: patient.patientId,
        doctorId,
        date,
        startTime: toBackendTime(slot),
        endTime: toBackendTime(endTime),
      })
      navigate('/receptionist/appointments')
    } catch (err) {
      setSubmitError(errorMessage(err, 'No se pudo crear la cita.'))
      setSubmitting(false)
    }
  }

  return (
    <>
      <Link
        to="/receptionist/appointments"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-500 transition hover:text-ink-800"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Volver a las citas
      </Link>

      <PageHeader title="Nueva cita" subtitle="Agenda una consulta en nombre de un paciente" />

      <form onSubmit={handleSubmit} className="space-y-5">
        <Step number={1} title="Paciente">
          <PatientPicker selected={patient} onSelect={setPatient} />
        </Step>

        <Step number={2} title="Doctor y fecha">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Doctor"
              required
              error={doctorsQuery.error ? 'No se pudo cargar la lista de doctores.' : undefined}
            >
              <Select
                value={doctorId}
                onChange={(e) => changeDoctor(e.target.value)}
                disabled={doctorsQuery.loading || Boolean(doctorsQuery.error)}
              >
                <option value="">Selecciona un doctor</option>
                {doctors.map((d) => (
                  <option key={d.doctorId} value={d.doctorId}>
                    {d.fullName} — {specialtyLabel(d.specialty)}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Fecha" required>
              <Input
                type="date"
                value={date}
                min={todayISO()}
                onChange={(e) => e.target.value && changeDate(e.target.value)}
              />
            </Field>
          </div>
        </Step>

        <Step number={3} title="Hora">
          {!doctorId && (
            <p className="text-sm text-ink-500">Selecciona primero un doctor y una fecha.</p>
          )}

          {doctorId && slotsQuery.loading && (
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton h-11 rounded-xl" />
              ))}
            </div>
          )}

          {doctorId && !slotsQuery.loading && slotsQuery.error && (
            <InlineError message={slotsQuery.error} />
          )}

          {doctorId && !slotsQuery.loading && !slotsQuery.error && slots.length === 0 && (
            <p className="rounded-xl bg-amber-50 px-3.5 py-3 text-sm text-amber-700">
              El doctor no atiende ese día. Prueba con otra fecha.
            </p>
          )}

          {doctorId && !slotsQuery.loading && !slotsQuery.error && slots.length > 0 && (
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
              {slots.map((s) => {
                const value = formatTime(s.time)
                const isSelected = slot === value
                const style = !s.available
                  ? 'cursor-not-allowed bg-ink-100 text-ink-400 line-through'
                  : isSelected
                    ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-600 ring-offset-2'
                    : 'border border-ink-200 bg-white text-ink-700 hover:border-brand-400 hover:bg-brand-50'
                return (
                  <button
                    key={s.time}
                    type="button"
                    disabled={!s.available}
                    onClick={() => setSlot(value)}
                    aria-pressed={isSelected}
                    className={`rounded-xl px-2 py-2.5 text-sm font-medium transition ${style}`}
                  >
                    {value}
                  </button>
                )
              })}
            </div>
          )}
        </Step>

        <InlineError message={submitError} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-600">
            {canSubmit || (patient && doctor && slot) ? (
              <>
                <span className="font-medium text-ink-900">{patient.fullName}</span> con{' '}
                <span className="font-medium text-ink-900">{doctor?.fullName}</span> ·{' '}
                {slot} – {endTime}
              </>
            ) : (
              'Completa los tres pasos para crear la cita.'
            )}
          </p>

          <div className="flex gap-2">
            <Link to="/receptionist/appointments">
              <Button variant="secondary" type="button">Cancelar</Button>
            </Link>
            <Button type="submit" disabled={!canSubmit} loading={submitting}>
              {submitting ? 'Creando…' : 'Crear cita'}
            </Button>
          </div>
        </div>
      </form>
    </>
  )
}
