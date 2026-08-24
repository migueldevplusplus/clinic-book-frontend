import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getDoctor, getSchedules } from '../../api/doctors'
import { useAsync } from '../../hooks/useAsync'
import { specialtyLabel, weekdayIndex, weekdayLabel } from '../../lib/constants'
import {
  formatLongDate, formatTime, nextDateForWeekday, todayISO, weekdayOf,
} from '../../lib/format'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import { Field, Input } from '../../components/ui/Field'
import { EmptyState, ErrorState, LoadingRows } from '../../components/ui/States'
import { CalendarIcon, ChevronLeftIcon, ClockIcon, StethoscopeIcon } from '../../components/ui/Icons'

export default function DoctorProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [date, setDate] = useState(todayISO())

  const doctorQuery = useAsync(() => getDoctor(id), [id])
  const scheduleQuery = useAsync(() => getSchedules(id), [id], { initialData: [] })

  const doctor = doctorQuery.data
  const schedules = useMemo(
    () =>
      [...(scheduleQuery.data ?? [])].sort(
        (a, b) =>
          weekdayIndex(a.dayOfWeek) - weekdayIndex(b.dayOfWeek) ||
          a.startTime.localeCompare(b.startTime),
      ),
    [scheduleQuery.data],
  )

  // Warn before navigating if the chosen day has no block at all.
  const worksOnChosenDay = useMemo(() => {
    if (!date || schedules.length === 0) return true
    return schedules.some((s) => s.dayOfWeek === weekdayOf(date))
  }, [date, schedules])

  const goToBooking = () => navigate(`/doctors/${id}/book?date=${date}`)

  if (doctorQuery.loading) {
    return (
      <>
        <div className="skeleton mb-6 h-8 w-64" />
        <LoadingRows rows={3} />
      </>
    )
  }

  if (doctorQuery.error) {
    return <ErrorState message={doctorQuery.error} onRetry={doctorQuery.reload} />
  }

  return (
    <>
      <Link
        to="/doctors"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-500 transition hover:text-ink-800"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Volver a la búsqueda
      </Link>

      {/* Doctor identity */}
      <div className="card mb-6 flex flex-wrap items-center gap-5 p-6">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-white">
          <StethoscopeIcon className="h-7 w-7" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">{doctor.fullName}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-0.5 font-medium text-brand-700">
              {specialtyLabel(doctor.specialty)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon className="h-4 w-4" />
              {doctor.consultationDurationMinutes} min por consulta
            </span>
          </div>
        </div>
      </div>

      <PageHeader title="Días de atención" subtitle="Elige un día para ver los horarios libres" />

      {scheduleQuery.loading && <LoadingRows rows={2} />}
      {!scheduleQuery.loading && scheduleQuery.error && (
        <ErrorState message={scheduleQuery.error} onRetry={scheduleQuery.reload} />
      )}

      {!scheduleQuery.loading && !scheduleQuery.error && schedules.length === 0 && (
        <EmptyState
          icon={CalendarIcon}
          title="Este doctor aún no publica horarios"
          message="No tiene bloques de atención configurados, así que no es posible agendar todavía."
        />
      )}

      {!scheduleQuery.loading && !scheduleQuery.error && schedules.length > 0 && (
        <>
          <ul className="mb-6 space-y-3">
            {schedules.map((block) => (
              <li key={block.id} className="card flex items-center gap-4 p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-600">
                  <CalendarIcon />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink-900">{weekdayLabel(block.dayOfWeek)}</p>
                  <p className="text-sm text-ink-500">
                    {formatTime(block.startTime)} – {formatTime(block.endTime)}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setDate(nextDateForWeekday(block.dayOfWeek))}
                >
                  Seleccionar
                </Button>
              </li>
            ))}
          </ul>

          <div className="card p-5">
            <Field
              label="Fecha de la cita"
              hint={date ? formatLongDate(date) : undefined}
              error={!worksOnChosenDay ? 'El doctor no atiende ese día de la semana.' : undefined}
            >
              <Input
                type="date"
                value={date}
                min={todayISO()}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>

            <Button
              size="lg"
              className="mt-4 w-full sm:w-auto"
              disabled={!date || !worksOnChosenDay}
              onClick={goToBooking}
            >
              Ver horarios disponibles
            </Button>
          </div>
        </>
      )}
    </>
  )
}
