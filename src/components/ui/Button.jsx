const VARIANTS = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-600/50',
  secondary:
    'bg-white text-ink-700 border border-ink-200 hover:bg-ink-50 hover:border-ink-300 disabled:text-ink-400',
  ghost: 'text-ink-600 hover:bg-ink-100 hover:text-ink-900 disabled:text-ink-300',
  danger:
    'bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 disabled:text-red-300',
  success:
    'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 disabled:bg-emerald-600/50',
}

const SIZES = {
  sm: 'text-xs px-2.5 py-1.5 gap-1.5 rounded-lg',
  md: 'text-sm px-4 py-2.5 gap-2 rounded-xl',
  lg: 'text-sm px-5 py-3 gap-2 rounded-xl',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...rest
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition
        disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading && (
        <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-r-transparent animate-spin" />
      )}
      {children}
    </button>
  )
}
