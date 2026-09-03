import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  createScheduleForDoctor, deleteScheduleForDoctor, listDoctors,
} from '../../api/doctors'
import { useAsync } from '../../hooks/useAsync'
import { specialtyLabel } from '../../lib/constants'
import PageHeader from '../../components/ui/PageHeader'
import ScheduleManager from '../../components/ScheduleManager'
import { Field, Select } from '../../components/ui/Field'
import { EmptyState, ErrorState, LoadingRows } from '../../components/ui/States'
import { ClockIcon, StethoscopeIcon } from '../../components/ui/Icons'

/**
 * Lets staff publish the hours of any doctor, for the ones who never set their
 * own. The selected doctor lives in the query string so the page can be linked
 * to straight from the user list.
 */
export default function DoctorSchedulesPage() {
  const [params, setParams] = useSearchParams()
  const doctorId = params.get('doctorId') ?? ''

  const doctorsQuery = useAsync(() => listDoctors(), [], { initialData: [] })
  const doctors = doctorsQuery.data ?? []
  const doctor = doctors.find((d) => d.doctorId === doctorId)

  // A doctorId that no longer matches anyone would leave the page stuck showing
  // a selector with nothing chosen and a schedule below it.
  const [invalid, setInvalid] = useState(false)
  useEffect(() => {
    setInvalid(Boolean(doctorId) && doctors.length > 0 && !doctor)
  }, [doctorId, doctors.length, doctor])

  const selectDoctor = (value) => {
    if (value) setParams({ doctorId: value })
    else setParams({})
  }

  return (
    <>
      <PageHeader
        title="Horarios de doctores"
        subtitle="Publica o retira los bloques de atención de cualquier doctor"
      />

      <div className="card mb-6 p-4 sm:max-w-md">
        <Field
          label="Doctor"
          error={
            doctorsQuery.error
              ? 'No se pudo cargar la lista de doctores.'
              : invalid
                ? 'El doctor seleccionado ya no existe.'
                : undefined
          }
        >
          <Select
            value={doctor ? doctorId : ''}
            onChange={(e) => selectDoctor(e.target.value)}
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
      </div>

      {doctorsQuery.loading && <LoadingRows rows={2} />}

      {!doctorsQuery.loading && doctorsQuery.error && (
        <ErrorState message={doctorsQuery.error} onRetry={doctorsQuery.reload} />
      )}

      {!doctorsQuery.loading && !doctorsQuery.error && doctors.length === 0 && (
        <EmptyState
          icon={StethoscopeIcon}
          title="No hay doctores registrados"
          message="Registra un doctor antes de configurar sus horarios."
        />
      )}

      {!doctorsQuery.loading && !doctorsQuery.error && doctors.length > 0 && !doctor && (
        <EmptyState
          icon={ClockIcon}
          title="Elige un doctor"
          message="Selecciona a quién quieres configurarle los horarios de atención."
        />
      )}

      {doctor && (
        <>
          <div className="card mb-5 flex items-center gap-4 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-700">
              <StethoscopeIcon />
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink-900">{doctor.fullName}</p>
              <p className="text-sm text-ink-500">
                {specialtyLabel(doctor.specialty)}
                <span className="mx-1.5 text-ink-300">·</span>
                {doctor.consultationDurationMinutes} min por consulta
              </p>
            </div>
          </div>

          <ScheduleManager
            key={doctor.doctorId}
            doctorId={doctor.doctorId}
            onCreate={(payload) => createScheduleForDoctor(doctor.doctorId, payload)}
            onDelete={(scheduleId) => deleteScheduleForDoctor(doctor.doctorId, scheduleId)}
            emptyMessage="Este doctor no tiene bloques, así que nadie puede agendar con él."
          />
        </>
      )}
    </>
  )
}
