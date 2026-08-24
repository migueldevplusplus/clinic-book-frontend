import Logo from '../../components/layout/Logo'

/** Split screen shared by login and registration. */
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-ink-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(60rem 40rem at 10% 0%, #0d9187 0%, transparent 55%), radial-gradient(40rem 30rem at 90% 100%, #115c58 0%, transparent 60%)',
          }}
        />
        <div className="relative flex items-center gap-3">
          <Logo className="h-10 w-10" />
          <span className="text-xl font-bold tracking-tight text-white">ClinicBook</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold leading-tight text-white">
            Agenda médica, sin llamadas ni esperas.
          </h2>
          <p className="mt-4 text-brand-100/80">
            Reserva con el especialista que necesitas, revisa tus citas y recibe
            confirmación al instante.
          </p>
          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
            {[
              ['13', 'Especialidades'],
              ['24/7', 'Disponible'],
              ['1 min', 'Para agendar'],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="text-2xl font-bold text-white">{value}</dt>
                <dd className="mt-0.5 text-xs text-brand-100/70">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="relative text-xs text-white/40">
          Proyecto de portafolio · Spring Boot + React
        </p>
      </div>

      {/* Form panel */}
      <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:min-h-0">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <Logo />
            <span className="text-lg font-bold tracking-tight text-ink-900">ClinicBook</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-ink-900">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-ink-500">{subtitle}</p>}

          <div className="mt-7">{children}</div>

          {footer && <div className="mt-6 text-center text-sm text-ink-500">{footer}</div>}
        </div>
      </div>
    </div>
  )
}
