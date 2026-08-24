import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLE_HOME } from '../lib/constants'
import Button from '../components/ui/Button'

export default function NotFoundPage() {
  const { role } = useAuth()

  return (
    <div className="card flex flex-col items-center gap-4 px-6 py-16 text-center">
      <p className="text-5xl font-bold tracking-tight text-ink-300">404</p>
      <div>
        <p className="text-lg font-semibold text-ink-900">Página no encontrada</p>
        <p className="mt-1 text-sm text-ink-500">
          La dirección que buscas no existe o cambió de lugar.
        </p>
      </div>
      <Link to={ROLE_HOME[role] ?? '/login'}>
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  )
}
