/** Label + control + error, so every form lines up the same way. */
export function Field({ label, error, hint, required, children }) {
  return (
    <div>
      {label && (
        <label className="field-label">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function Input({ className = '', ...rest }) {
  return <input className={`field-input ${className}`} {...rest} />
}

export function Select({ className = '', children, ...rest }) {
  return (
    <div className="relative">
      <select className={`field-input appearance-none pr-9 ${className}`} {...rest}>
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  )
}
