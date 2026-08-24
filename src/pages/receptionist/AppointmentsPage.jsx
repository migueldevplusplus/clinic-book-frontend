import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  allAppointments, cancelAsReceptionist, completeAsReceptionist,
  confirmAppointment, doctorAgendaForReceptionist,
} from '../../api/appointments'
import { listDoctors } from '../../api/doctors'
import { useAsync } from '../../hooks/useAsync'
import { errorMessage } from '../../api/client'
import { formatLongDate, todayISO } from '../../lib/format'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import { Field, Input, Select } from '../../components/ui/Field'
import AppointmentItem from '../../components/AppointmentItem'
import { EmptyState, ErrorState, InlineError, LoadingRows } from '../../components/ui/States'
import { CalendarIcon, CheckIcon, PlusIcon, XIcon } from '../../components/ui/Icons'

/**
 * The two endpoints return different shapes: /all carries doctorName and
 * startTime, while the per-doctor one carries start and no doctor at all.
 * Normalizing here keeps the list rendering in one place.
 */
function normalize(row, doctorName) {
  return {
    id: row.appointmentId,
    doctorName: row.doctorName ?? doctorName ?? '—',
    patientName: row.patientName,
    date: row.appointmentDate,
    time: row.startTime ?? row.start,
    status: row.status,
  }
}

export default function AppointmentsPage() {
  const [date, setDate] = useState(todayISO())
  const [doctorId, setDoctorId] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState(null)

  const doctorsQuery = useAsync(() => listDoctors(), [], { initialData: [] })
  const doctors = doctorsQuery.data ?? []

  const { data, loading, error, reload } = useAsync(
    () => (doctorId ? doctorAgendaForReceptionist(doctorId, date) : allAppointments(date)),
    [doctorId, date],
    { initialData: [] },
  )

  const rows = useMemo(() => {
    const selectedName = doctors.find((d) => d.doctorId === doctorId)?.fullName
    return (data ?? [])
      .map((row) => normalize(row, selectedName))
      .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))
  }, [data, doctors, doctorId])

  const runAction = async (id, action, fallback) => {
    setActionError(null)
    setBusyId(id)
    try {
      await action(id)
      await reload()
    } catch (err) {
      setActionError(errorMessage(err, fallback))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <PageHeader
        title="Todas las citas"
        subtitle={formatLongDate(date)}
        actions={
          <Link to="/receptionist/appointments/new">
            <Button size="sm">
              <PlusIcon className="h-4 w-4" />
              Nueva cita
            </Button>
          </Link>
        }
      />

      <div className="card mb-6 grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
        <Field
          label="Doctor"
          error={doctorsQuery.error ? 'No se pudo cargar la lista de doctores.' : undefined}
        >
          <Select
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            disabled={doctorsQuery.loading || Boolean(doctorsQuery.error)}
          >
            <option value="">Todos los doctores</option>
            {doctors.map((d) => (
              <option key={d.doctorId} value={d.doctorId}>{d.fullName}</option>
            ))}
          </Select>
        </Field>

        <Field label="Fecha">
          <Input
            type="date"
            value={date}
            onChange={(e) => e.target.value && setDate(e.target.value)}
          />
        </Field>
      </div>

      {actionError && (
        <div className="mb-4">
          <InlineError message={actionError} />
        </div>
      )}

      {loading && <LoadingRows rows={4} />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && rows.length === 0 && (
        <EmptyState
          icon={CalendarIcon}
          title="Sin citas para este filtro"
          message="No hay consultas agendadas con los criterios seleccionados."
          action={
            <Link to="/receptionist/appointments/new">
              <Button variant="secondary" size="sm">Crear una cita</Button>
            </Link>
          }
        />
      )}

      {!loading && !error && rows.length > 0 && (
        <>
          <p className="mb-3 text-sm text-ink-500">
            {rows.length} {rows.length === 1 ? 'cita' : 'citas'}
          </p>
          <ul className="space-y-3">
            {rows.map((row) => (
              <AppointmentItem
                key={row.id}
                title={row.patientName}
                meta={row.doctorName}
                date={row.date}
                time={row.time}
                status={row.status}
                accent="bg-brand-50 text-brand-700"
                muted={row.status === 'CANCELLED'}
                actions={
                  <>
                    {row.status === 'PENDING' && (
                      <Button
                        variant="primary"
                        size="sm"
                        loading={busyId === row.id}
                        onClick={() =>
                          runAction(row.id, confirmAppointment, 'No se pudo confirmar la cita.')
                        }
                      >
                        <CheckIcon className="h-4 w-4" />
                        Confirmar
                      </Button>
                    )}
                    {row.status === 'CONFIRMED' && (
                      <Button
                        variant="success"
                        size="sm"
                        loading={busyId === row.id}
                        onClick={() =>
                          runAction(row.id, completeAsReceptionist, 'No se pudo completar la cita.')
                        }
                      >
                        Completar
                      </Button>
                    )}
                    {(row.status === 'PENDING' || row.status === 'CONFIRMED') && (
                      <Button
                        variant="danger"
                        size="sm"
                        loading={busyId === row.id}
                        onClick={() =>
                          runAction(row.id, cancelAsReceptionist, 'No se pudo cancelar la cita.')
                        }
                      >
                        <XIcon className="h-4 w-4" />
                        Cancelar
                      </Button>
                    )}
                  </>
                }
              />
            ))}
          </ul>
        </>
      )}
    </>
  )
}
