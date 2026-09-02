import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ROLE_LABELS } from '../../lib/constants'
import Logo from './Logo'
import {
  CalendarIcon, ClipboardIcon, ClockIcon, LogoutIcon,
  MenuIcon, SearchIcon, ShieldIcon, UsersIcon,
} from '../ui/Icons'

// Which links each role sees. Routing enforces this too; this only shapes the nav.
const NAV_BY_ROLE = {
  PATIENT: [
    { to: '/doctors', label: 'Buscar doctor', icon: SearchIcon },
    { to: '/appointments', label: 'Mis citas', icon: CalendarIcon },
  ],
  DOCTOR: [
    { to: '/doctor/agenda', label: 'Mi agenda', icon: CalendarIcon },
    { to: '/doctor/upcoming', label: 'Próximas citas', icon: ClockIcon },
    { to: '/doctor/schedule', label: 'Mis horarios', icon: ClipboardIcon },
  ],
  RECEPTIONIST: [
    { to: '/receptionist/appointments', label: 'Todas las citas', icon: CalendarIcon },
    { to: '/receptionist/appointments/new', label: 'Nueva cita', icon: ClipboardIcon },
  ],
  SUPER_ADMIN: [{ to: '/admin', label: 'Administración', icon: ShieldIcon }],
}

function initialsOf(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('')
}

export default function AppLayout() {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const links = NAV_BY_ROLE[role] ?? []

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? 'bg-brand-50 text-brand-700'
        : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
    }`

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar. Pinned to the viewport rather than growing with the
          page, so the account controls at its foot stay reachable on long lists
          instead of sitting at the bottom of the document. */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-ink-200 bg-white lg:flex lg:flex-col">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <Logo />
          <span className="text-lg font-bold tracking-tight text-ink-900">ClinicBook</span>
        </div>

        {/* Scrolls on its own if the links ever outgrow a short viewport. */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end className={navLinkClass}>
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-ink-100 p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-800 text-xs font-semibold text-white">
              {initialsOf(user?.fullName)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink-900">{user?.fullName}</p>
              <p className="text-xs text-ink-500">{ROLE_LABELS[role] ?? role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogoutIcon className="h-[18px] w-[18px]" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile header, pinned for the same reason as the sidebar. */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <span className="font-bold text-ink-900">ClinicBook</span>
        </div>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-lg p-2 text-ink-600 hover:bg-ink-100"
          aria-label="Menú"
          aria-expanded={menuOpen}
        >
          <MenuIcon />
        </button>
      </header>

      {menuOpen && (
        <div className="border-b border-ink-200 bg-white px-3 py-3 lg:hidden">
          <nav className="space-y-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end
                className={navLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                <Icon className="h-[18px] w-[18px]" />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-2 border-t border-ink-100 pt-2">
            <p className="px-3 py-1 text-xs text-ink-500">
              {user?.fullName} · {ROLE_LABELS[role] ?? role}
            </p>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogoutIcon className="h-[18px] w-[18px]" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
