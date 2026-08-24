import { useMemo, useState } from 'react'
import { completeAppointment, doctorAgenda } from '../../api/appointments'
import { useAsync } from '../../hooks/useAsync'
import { errorMessage } from '../../api/client'
import { addDays, formatLongDate, todayISO } from '../../lib/format'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import AppointmentItem from '../../components/AppointmentItem'
import { EmptyState, ErrorState, InlineError, LoadingRows } from '../../components/ui/States'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '../../components/ui/Icons'

export default function AgendaPage() {
  const [date, setDate] = useState(todayISO())
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState(null)

  const { data, loading, error, reload } = useAsync(() => doctorAgenda(date), [date], {
    initialData: [],
  })

  const appointments = useMemo(
    () => [...(data ?? [])].sort((a, b) => a.start.localeCompare(b.start)),
    [data],
  )

  const handleComplete = async (appointment) => {
    setActionError(null)
    setBusyId(appointment.appointmentId)
    try {
      await completeAppointment(appointment.appointmentId)
      await reload()
    } catch (err) {
      setActionError(errorMessage(err, 'No se pudo marcar la cita como completada.'))
    } finally {
      setBusyId(null)
    }
  }

  const isToday = date === todayISO()

  return (
    <>
      <PageHeader title="Mi agenda" subtitle={formatLongDate(date)} />

      {/* Date navigation */}
      <div className="card mb-6 flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDate(addDays(date, -1))}
            aria-label="Día anterior"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={isToday ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setDate(todayISO())}
          >
            Hoy
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDate(addDays(date, 1))}
            aria-label="Día siguiente"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>

        <input
          type="date"
          value={date}
          onChange={(e) => e.target.value && setDate(e.target.value)}
          className="field-input w-auto py-1.5 text-sm"
          aria-label="Ir a una fecha"
        />
      </div>

      {actionError && (
        <div className="mb-4">
          <InlineError message={actionError} />
        </div>
      )}

      {loading && <LoadingRows rows={4} />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && appointments.length === 0 && (
        <EmptyState
          icon={CalendarIcon}
          title="Sin citas para este día"
          message="No tienes consultas agendadas en la fecha seleccionada."
        />
      )}

      {!loading && !error && appointments.length > 0 && (
        <>
          <p className="mb-3 text-sm text-ink-500">
            {appointments.length} {appointments.length === 1 ? 'cita agendada' : 'citas agendadas'}
          </p>
          <ul className="space-y-3">
            {appointments.map((appointment) => (
              <AppointmentItem
                key={appointment.appointmentId}
                title={appointment.patientName}
                date={appointment.appointmentDate}
                time={appointment.start}
                status={appointment.status}
                accent="bg-brand-50 text-brand-700"
                muted={appointment.status === 'CANCELLED'}
                actions={
                  // Only a confirmed appointment can be completed; the domain
                  // rejects any other transition.
                  appointment.status === 'CONFIRMED' ? (
                    <Button
                      variant="success"
                      size="sm"
                      loading={busyId === appointment.appointmentId}
                      onClick={() => handleComplete(appointment)}
                    >
                      Completada
                    </Button>
                  ) : null
                }
              />
            ))}
          </ul>
        </>
      )}
    </>
  )
}
