import { useMemo, useState } from 'react'
import { getSchedules } from '../api/doctors'
import { useAsync } from '../hooks/useAsync'
import { errorMessage } from '../api/client'
import { WEEKDAYS, weekdayIndex, weekdayLabel } from '../lib/constants'
import { formatTime, toBackendTime } from '../lib/format'
import Button from './ui/Button'
import Modal from './ui/Modal'
import { Field, Input, Select } from './ui/Field'
import { EmptyState, ErrorState, InlineError, LoadingRows } from './ui/States'
import { ClipboardIcon, PlusIcon, TrashIcon } from './ui/Icons'

const EMPTY_BLOCK = { dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '12:00' }

/**
 * Weekly schedule blocks for one doctor.
 *
 * A doctor edits their own through endpoints that take the id from the token,
 * while staff edit anyone's through endpoints that name the doctor in the path.
 * The screens differ only in which call they hand over, so the list, the form
 * and the confirmations live here once.
 */
export default function ScheduleManager({ doctorId, onCreate, onDelete, emptyMessage }) {
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
      await onCreate({
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
      await onDelete(toDelete.id)
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
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={openAdd} disabled={!doctorId}>
          <PlusIcon className="h-4 w-4" />
          Agregar horario
        </Button>
      </div>

      {loading && <LoadingRows rows={3} />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && blocks.length === 0 && (
        <EmptyState
          icon={ClipboardIcon}
          title="Sin horarios configurados"
          message={emptyMessage ?? 'Sin bloques de atención, los pacientes no pueden agendar.'}
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
