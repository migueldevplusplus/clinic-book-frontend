import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cancelOwnAppointment, myAppointments } from '../../api/appointments'
import { useAsync } from '../../hooks/useAsync'
import { errorMessage } from '../../api/client'
import { isPast } from '../../lib/format'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import AppointmentItem from '../../components/AppointmentItem'
import {
  EmptyState, ErrorState, InlineError, InlineSuccess, LoadingRows,
} from '../../components/ui/States'
import { CalendarIcon } from '../../components/ui/Icons'

/** PENDING and CONFIRMED that have not happened yet belong to "upcoming". */
function isUpcoming(appointment) {
  const active = appointment.status === 'PENDING' || appointment.status === 'CONFIRMED'
  return active && !isPast(appointment.appointmentDate, appointment.start)
}

export default function MyAppointmentsPage() {
  const location = useLocation()
  const { data, loading, error, reload } = useAsync(myAppointments, [], { initialData: [] })

  const [toCancel, setToCancel] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState(null)
  const [notice, setNotice] = useState(
    location.state?.justBooked ? 'Tu cita fue agendada correctamente.' : null,
  )

  const { upcoming, history } = useMemo(() => {
    const list = [...(data ?? [])]
    const byDateAsc = (a, b) =>
      a.appointmentDate.localeCompare(b.appointmentDate) || a.start.localeCompare(b.start)

    return {
      upcoming: list.filter(isUpcoming).sort(byDateAsc),
      history: list.filter((a) => !isUpcoming(a)).sort((a, b) => byDateAsc(b, a)),
    }
  }, [data])

  const handleCancel = async () => {
    setCancelError(null)
    setCancelling(true)
    try {
      await cancelOwnAppointment(toCancel.appointmentId)
      setToCancel(null)
      setNotice('La cita fue cancelada.')
      await reload()
    } catch (err) {
      setCancelError(errorMessage(err, 'No se pudo cancelar la cita.'))
    } finally {
      setCancelling(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Mis citas"
        subtitle="Consulta tus próximas consultas y tu historial"
        actions={
          <Link to="/doctors">
            <Button size="sm">Agendar nueva cita</Button>
          </Link>
        }
      />

      {notice && (
        <div className="mb-5">
          <InlineSuccess message={notice} />
        </div>
      )}

      {loading && <LoadingRows rows={3} />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && (
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-500">
              Próximas
            </h2>
            {upcoming.length === 0 ? (
              <EmptyState
                icon={CalendarIcon}
                title="No tienes citas próximas"
                message="Busca un especialista y agenda tu próxima consulta."
                action={
                  <Link to="/doctors">
                    <Button variant="secondary" size="sm">Buscar doctor</Button>
                  </Link>
                }
              />
            ) : (
              <ul className="space-y-3">
                {upcoming.map((appointment) => (
                  <AppointmentItem
                    key={appointment.appointmentId}
                    title={appointment.doctorName}
                    date={appointment.appointmentDate}
                    time={appointment.start}
                    status={appointment.status}
                    accent="bg-brand-50 text-brand-700"
                    actions={
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => { setToCancel(appointment); setCancelError(null) }}
                      >
                        Cancelar
                      </Button>
                    }
                  />
                ))}
              </ul>
            )}
          </section>

          {history.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-500">
                Historial
              </h2>
              <ul className="space-y-3">
                {history.map((appointment) => (
                  <AppointmentItem
                    key={appointment.appointmentId}
                    title={appointment.doctorName}
                    date={appointment.appointmentDate}
                    time={appointment.start}
                    status={appointment.status}
                    muted
                  />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      <Modal
        open={Boolean(toCancel)}
        onClose={() => !cancelling && setToCancel(null)}
        title="Cancelar cita"
        description="Esta acción no se puede deshacer."
        footer={
          <>
            <Button variant="secondary" onClick={() => setToCancel(null)} disabled={cancelling}>
              Volver
            </Button>
            <Button variant="danger" onClick={handleCancel} loading={cancelling}>
              {cancelling ? 'Cancelando…' : 'Sí, cancelar'}
            </Button>
          </>
        }
      >
        <InlineError message={cancelError} />
        {toCancel && (
          <p className="mt-1 text-sm text-ink-600">
            ¿Seguro que quieres cancelar tu cita con{' '}
            <span className="font-medium text-ink-900">{toCancel.doctorName}</span>?
          </p>
        )}
      </Modal>
    </>
  )
}
