import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getDoctor } from '../../api/doctors'
import { bookAsPatient, getAvailability } from '../../api/appointments'
import { useAsync } from '../../hooks/useAsync'
import { errorMessage } from '../../api/client'
import { specialtyLabel } from '../../lib/constants'
import { addMinutes, formatLongDate, formatTime, todayISO, toBackendTime } from '../../lib/format'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { EmptyState, ErrorState, InlineError } from '../../components/ui/States'
import { ChevronLeftIcon, ClockIcon } from '../../components/ui/Icons'

function SlotGridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="skeleton h-11 rounded-xl" />
      ))}
    </div>
  )
}

function slotClasses(slot, isSelected) {
  if (!slot.available) {
    return 'cursor-not-allowed bg-ink-100 text-ink-400 line-through'
  }
  if (isSelected) {
    return 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-600 ring-offset-2'
  }
  return 'border border-ink-200 bg-white text-ink-700 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700'
}

export default function BookingPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const date = params.get('date') || todayISO()

  const [selected, setSelected] = useState(null)
  const [confirming, setConfirming] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const doctorQuery = useAsync(() => getDoctor(id), [id])
  const slotsQuery = useAsync(() => getAvailability(id, date), [id, date], { initialData: [] })

  const doctor = doctorQuery.data
  const slots = slotsQuery.data ?? []
  const duration = doctor?.consultationDurationMinutes ?? 30
  const endTime = selected ? addMinutes(selected, duration) : null
  const available = slots.filter((s) => s.available)

  const handleConfirm = async () => {
    setSubmitError(null)
    setSubmitting(true)
    try {
      await bookAsPatient({
        doctorId: id,
        date,
        startTime: toBackendTime(selected),
        endTime: toBackendTime(endTime),
      })
      navigate('/appointments', { state: { justBooked: true } })
    } catch (err) {
      setSubmitError(errorMessage(err, 'No se pudo agendar la cita.'))
      setSubmitting(false)
    }
  }

  return (
    <>
      <Link
        to={`/doctors/${id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-500 transition hover:text-ink-800"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Volver al perfil
      </Link>

      <PageHeader
        title={doctor ? doctor.fullName : 'Horarios disponibles'}
        subtitle={
          doctor
            ? `${specialtyLabel(doctor.specialty)} · ${formatLongDate(date)}`
            : formatLongDate(date)
        }
      />

      {doctorQuery.error && <ErrorState message={doctorQuery.error} onRetry={doctorQuery.reload} />}

      {!doctorQuery.error && (
        <div className="card p-5">
          {slotsQuery.loading && <SlotGridSkeleton />}

          {!slotsQuery.loading && slotsQuery.error && (
            <ErrorState message={slotsQuery.error} onRetry={slotsQuery.reload} />
          )}

          {!slotsQuery.loading && !slotsQuery.error && slots.length === 0 && (
            <EmptyState
              icon={ClockIcon}
              title="Sin horarios para esta fecha"
              message="El doctor no atiende ese día. Elige otra fecha desde su perfil."
              action={
                <Button variant="secondary" size="sm" onClick={() => navigate(`/doctors/${id}`)}>
                  Cambiar fecha
                </Button>
              }
            />
          )}

          {!slotsQuery.loading && !slotsQuery.error && slots.length > 0 && (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-ink-500">
                  {available.length} de {slots.length} horarios libres
                </p>
                <p className="text-xs text-ink-400">Consulta de {duration} minutos</p>
              </div>

              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
                {slots.map((slot) => {
                  const value = formatTime(slot.time)
                  const isSelected = selected === value
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelected(value)}
                      aria-pressed={isSelected}
                      className={`rounded-xl px-2 py-2.5 text-sm font-medium transition ${slotClasses(slot, isSelected)}`}
                    >
                      {value}
                    </button>
                  )
                })}
              </div>

              {available.length === 0 && (
                <p className="mt-4 rounded-xl bg-amber-50 px-3.5 py-3 text-sm text-amber-700">
                  Todos los horarios de este día ya están ocupados.
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-5">
                <p className="text-sm text-ink-600">
                  {selected ? (
                    <>
                      Seleccionado:{' '}
                      <span className="font-semibold text-ink-900">
                        {selected} – {endTime}
                      </span>
                    </>
                  ) : (
                    'Elige un horario para continuar'
                  )}
                </p>
                <Button size="lg" disabled={!selected} onClick={() => setConfirming(true)}>
                  Agendar
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      <Modal
        open={confirming}
        onClose={() => !submitting && setConfirming(false)}
        title="Confirmar cita"
        description="Revisa los datos antes de agendar."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirming(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} loading={submitting}>
              {submitting ? 'Agendando…' : 'Confirmar'}
            </Button>
          </>
        }
      >
        <InlineError message={submitError} />
        <dl className="mt-1 divide-y divide-ink-100">
          {[
            ['Doctor', doctor?.fullName],
            ['Especialidad', doctor ? specialtyLabel(doctor.specialty) : ''],
            ['Fecha', formatLongDate(date)],
            ['Hora', selected ? `${selected} – ${endTime}` : ''],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-2.5">
              <dt className="text-sm text-ink-500">{label}</dt>
              <dd className="text-right text-sm font-medium text-ink-900">{value}</dd>
            </div>
          ))}
        </dl>
      </Modal>
    </>
  )
}
