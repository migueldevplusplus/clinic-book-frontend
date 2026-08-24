import { STATUS_LABELS } from '../../lib/constants'

const STYLES = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  CONFIRMED: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  CANCELLED: 'bg-ink-100 text-ink-500 ring-ink-500/20',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
        ring-1 ring-inset whitespace-nowrap ${STYLES[status] ?? STYLES.CANCELLED}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
