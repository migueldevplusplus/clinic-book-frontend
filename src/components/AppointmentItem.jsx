import StatusBadge from './ui/StatusBadge'
import { formatShortDate, formatTime } from '../lib/format'
import { CalendarIcon } from './ui/Icons'

/**
 * One appointment row, shared by the patient, doctor and receptionist lists.
 * Each of those returns a different DTO, so the caller decides what the title
 * and the meta line say; this only handles the layout.
 */
export default function AppointmentItem({
  title,
  meta,
  date,
  time,
  status,
  actions,
  muted = false,
  accent,
}) {
  return (
    <li
      className={`card flex flex-wrap items-center gap-x-4 gap-y-3 p-4 transition ${
        muted ? 'opacity-70' : ''
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          accent ?? 'bg-ink-100 text-ink-500'
        }`}
      >
        {time ? (
          <span className="text-xs font-semibold tabular-nums">{formatTime(time)}</span>
        ) : (
          <CalendarIcon />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink-900">{title}</p>
        <p className="mt-0.5 truncate text-sm text-ink-500">
          {date && formatShortDate(date)}
          {date && meta && <span className="mx-1.5 text-ink-300">·</span>}
          {meta}
        </p>
      </div>

      {status && <StatusBadge status={status} />}

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </li>
  )
}
