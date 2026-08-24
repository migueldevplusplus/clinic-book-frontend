export default function Logo({ className = 'h-9 w-9' }) {
  return (
    <span
      className={`flex items-center justify-center rounded-xl bg-gradient-to-br
                  from-brand-400 to-brand-700 text-white shadow-sm ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path
          d="M12 5v14M5 12h14"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}
