import { AlertIcon, InboxIcon } from './Icons'
import Button from './Button'

/** Rectangles that mimic the rows about to load, instead of a blank screen. */
export function LoadingRows({ rows = 4 }) {
  return (
    <div className="space-y-3" role="status" aria-label="Cargando">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card flex items-center gap-4 p-4">
          <div className="skeleton h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3.5 w-1/3" />
            <div className="skeleton h-3 w-1/4" />
          </div>
          <div className="skeleton h-7 w-24 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertIcon className="h-6 w-6" />
      </span>
      <div>
        <p className="font-medium text-ink-900">No se pudo cargar la información</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-ink-500">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}

export function EmptyState({ title, message, icon: CustomIcon, action }) {
  const Glyph = CustomIcon ?? InboxIcon
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-400">
        <Glyph className="h-6 w-6" />
      </span>
      <div>
        <p className="font-medium text-ink-900">{title}</p>
        {message && <p className="mx-auto mt-1 max-w-md text-sm text-ink-500">{message}</p>}
      </div>
      {action}
    </div>
  )
}

/** Inline error for form submissions, where a full-page state is too much. */
export function InlineError({ message }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3">
      <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
      <p className="text-sm text-red-700">{message}</p>
    </div>
  )
}

export function InlineSuccess({ message }) {
  if (!message) return null
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3">
      <p className="text-sm text-emerald-700">{message}</p>
    </div>
  )
}
