import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listDoctors } from '../../api/doctors'
import { useAsync } from '../../hooks/useAsync'
import { SPECIALTIES, specialtyLabel } from '../../lib/constants'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import { Field, Input, Select } from '../../components/ui/Field'
import { EmptyState, ErrorState, LoadingRows } from '../../components/ui/States'
import { ChevronRightIcon, SearchIcon, StethoscopeIcon } from '../../components/ui/Icons'

export default function DoctorSearchPage() {
  const [specialty, setSpecialty] = useState('')
  const [nameQuery, setNameQuery] = useState('')

  // Refetches whenever the specialty changes; an empty value asks for all.
  const { data, loading, error, reload } = useAsync(
    () => listDoctors(specialty || undefined),
    [specialty],
    { initialData: [] },
  )

  // The backend filters by specialty only, so narrowing by name happens here.
  const doctors = useMemo(() => {
    const list = data ?? []
    const q = nameQuery.trim().toLowerCase()
    return q ? list.filter((d) => d.fullName.toLowerCase().includes(q)) : list
  }, [data, nameQuery])

  const clearFilters = () => { setSpecialty(''); setNameQuery('') }

  return (
    <>
      <PageHeader
        title="Buscar doctor"
        subtitle="Filtra por especialidad y elige con quién quieres agendar"
      />

      <div className="card mb-6 grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
        <Field label="Especialidad">
          <Select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
            <option value="">Todas las especialidades</option>
            {SPECIALTIES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
        </Field>

        <Field label="Nombre del doctor">
          <Input
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
            placeholder="Ej: García"
          />
        </Field>
      </div>

      {loading && <LoadingRows rows={4} />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && doctors.length === 0 && (
        <EmptyState
          icon={SearchIcon}
          title="No encontramos doctores"
          message={
            specialty || nameQuery
              ? 'Prueba con otra especialidad o limpia los filtros.'
              : 'Todavía no hay doctores registrados en el sistema.'
          }
          action={
            (specialty || nameQuery) ? (
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            ) : null
          }
        />
      )}

      {!loading && !error && doctors.length > 0 && (
        <>
          <p className="mb-3 text-sm text-ink-500">
            {doctors.length} {doctors.length === 1 ? 'doctor disponible' : 'doctores disponibles'}
          </p>

          <ul className="space-y-3">
            {doctors.map((doctor) => (
              <li key={doctor.doctorId}>
                <Link
                  to={`/doctors/${doctor.doctorId}`}
                  className="card flex items-center gap-4 p-4 transition hover:border-brand-300 hover:shadow-lift"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-700">
                    <StethoscopeIcon />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink-900">{doctor.fullName}</p>
                    <p className="mt-0.5 text-sm text-ink-500">
                      {specialtyLabel(doctor.specialty)}
                      <span className="mx-1.5 text-ink-300">·</span>
                      {doctor.consultationDurationMinutes} min por consulta
                    </p>
                  </div>

                  <span className="hidden items-center gap-1 text-sm font-medium text-brand-700 sm:inline-flex">
                    Ver perfil
                    <ChevronRightIcon className="h-4 w-4" />
                  </span>
                  <ChevronRightIcon className="h-5 w-5 text-ink-300 sm:hidden" />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}
