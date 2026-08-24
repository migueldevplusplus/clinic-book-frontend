import { useMemo } from 'react'
import { doctorUpcoming } from '../../api/appointments'
import { useAsync } from '../../hooks/useAsync'
import PageHeader from '../../components/ui/PageHeader'
import AppointmentItem from '../../components/AppointmentItem'
import { EmptyState, ErrorState, LoadingRows } from '../../components/ui/States'
import { ClockIcon } from '../../components/ui/Icons'
import { formatLongDate } from '../../lib/format'

export default function UpcomingPage() {
  const { data, loading, error, reload } = useAsync(doctorUpcoming, [], { initialData: [] })

  // The backend already orders these, but grouping needs a stable sort anyway.
  const groups = useMemo(() => {
    const list = [...(data ?? [])].sort(
      (a, b) =>
        a.appointmentDate.localeCompare(b.appointmentDate) || a.start.localeCompare(b.start),
    )
    return list.reduce((acc, appointment) => {
      const key = appointment.appointmentDate
      acc[key] = acc[key] ?? []
      acc[key].push(appointment)
      return acc
    }, {})
  }, [data])

  const dates = Object.keys(groups)

  return (
    <>
      <PageHeader
        title="Próximas citas"
        subtitle="Todas tus consultas agendadas de hoy en adelante"
      />

      {loading && <LoadingRows rows={4} />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && dates.length === 0 && (
        <EmptyState
          icon={ClockIcon}
          title="No tienes citas próximas"
          message="Cuando un paciente agende contigo, aparecerá aquí."
        />
      )}

      {!loading && !error && dates.length > 0 && (
        <div className="space-y-8">
          {dates.map((date) => (
            <section key={date}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-500">
                {formatLongDate(date)}
              </h2>
              <ul className="space-y-3">
                {groups[date].map((appointment) => (
                  <AppointmentItem
                    key={appointment.appointmentId}
                    title={appointment.patientName}
                    time={appointment.start}
                    status={appointment.status}
                    accent="bg-brand-50 text-brand-700"
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
