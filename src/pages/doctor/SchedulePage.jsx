import { useMemo, useState } from 'react'
import { createSchedule, deleteSchedule, getSchedules } from '../../api/doctors'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../context/AuthContext'
import { errorMessage } from '../../api/client'
import { WEEKDAYS, weekdayIndex, weekdayLabel } from '../../lib/constants'
import { formatTime, toBackendTime } from '../../lib/format'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Field, Input, Select } from '../../components/ui/Field'
import { EmptyState, ErrorState, InlineError, LoadingRows } from '../../components/ui/States'
import { ClipboardIcon, PlusIcon, TrashIcon } from '../../components/ui/Icons'

const EMPTY_BLOCK = { dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '12:00' }

export default function SchedulePage() {
  const { user } = useAuth()
  // A doctor's id equals their user id, so the token identifies the schedule owner.
  const doctorId = user?.userId

  const { data, loading, error, reload } = useAsync(
    () => getSchedules(doctorId),
    [doctorId],
    { skip: !doctorId, initialData: [] },
  )

  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(EMPTY_BLOCK)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)

  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const blocks = useMemo(
    () =>
      [...(data ?? [])].sort(
        (a, b) =>
          weekdayIndex(a.dayOfWeek) - weekdayIndex(b.dayOfWeek) ||
          a.startTime.localeCompare(b.startTime),
      ),
    [data],
  )

  const openAdd = () => {
    setForm(EMPTY_BLOCK)
    setFormError(null)
    setAdding(true)
  }

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (!form.startTime || !form.endTime) {
      setFormError('Indica la hora de inicio y de fin.')
      return
    }
    if (form.startTime >= form.endTime) {
      setFormError('La hora de fin debe ser posterior a la de inicio.')
      return
    }

    setSaving(true)
    try {
      await createSchedule({
        dayOfWeek: form.dayOfWeek,
        startTime: toBackendTime(form.startTime),
        endTime: toBackendTime(form.endTime),
      })
      setAdding(false)
      await reload()
    } catch (err) {
      setFormError(errorMessage(err, 'No se pudo guardar el horario.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleteError(null)
    setDeleting(true)
    try {
      await deleteSchedule(toDelete.id)
      setToDelete(null)
      await reload()
    } catch (err) {
      setDeleteError(errorMessage(err, 'No se pudo eliminar el horario.'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Mis horarios"
        subtitle="Define los bloques en los que atiendes cada semana"
        actions={
          <Button size="sm" onClick={openAdd}>
            <PlusIcon className="h-4 w-4" />
            Agregar horario
          </Button>
        }
      />

      {loading && <LoadingRows rows={3} />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && blocks.length === 0 && (
        <EmptyState
          icon={ClipboardIcon}
          title="Aún no tienes horarios"
          message="Sin bloques de atención, los pacientes no pueden agendar contigo."
          action={
            <Button size="sm" onClick={openAdd}>
              <PlusIcon className="h-4 w-4" />
              Agregar horario
            </Button>
          }
        />
      )}

      {!loading && !error && blocks.length > 0 && (
        <ul className="space-y-3">
          {blocks.map((block) => (
            <li key={block.id} className="card flex items-center gap-4 p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <ClipboardIcon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink-900">{weekdayLabel(block.dayOfWeek)}</p>
                <p className="text-sm text-ink-500">
                  {formatTime(block.startTime)} – {formatTime(block.endTime)}
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => { setToDelete(block); setDeleteError(null) }}
              >
                <TrashIcon className="h-4 w-4" />
                Eliminar
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* Add block */}
      <Modal
        open={adding}
        onClose={() => !saving && setAdding(false)}
        title="Agregar horario"
        description="El bloque se repite todas las semanas."
        footer={
          <>
            <Button variant="secondary" onClick={() => setAdding(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" form="schedule-form" loading={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </>
        }
      >
        <form id="schedule-form" onSubmit={handleSave} className="space-y-4" noValidate>
          <InlineError message={formError} />

          <Field label="Día" required>
            <Select value={form.dayOfWeek} onChange={update('dayOfWeek')}>
              {WEEKDAYS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Desde" required>
              <Input type="time" value={form.startTime} onChange={update('startTime')} />
            </Field>
            <Field label="Hasta" required>
              <Input type="time" value={form.endTime} onChange={update('endTime')} />
            </Field>
          </div>
        </form>
      </Modal>

      {/* Delete block */}
      <Modal
        open={Boolean(toDelete)}
        onClose={() => !deleting && setToDelete(null)}
        title="Eliminar horario"
        description="Los pacientes ya no podrán agendar en ese bloque."
        footer={
          <>
            <Button variant="secondary" onClick={() => setToDelete(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              {deleting ? 'Eliminando…' : 'Eliminar'}
            </Button>
          </>
        }
      >
        <InlineError message={deleteError} />
        {toDelete && (
          <p className="mt-1 text-sm text-ink-600">
            ¿Eliminar el bloque de{' '}
            <span className="font-medium text-ink-900">
              {weekdayLabel(toDelete.dayOfWeek)} {formatTime(toDelete.startTime)} –{' '}
              {formatTime(toDelete.endTime)}
            </span>
            ?
          </p>
        )}
      </Modal>
    </>
  )
}
