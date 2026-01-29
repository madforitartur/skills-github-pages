import { Link, NavLink } from 'react-router-dom'
import { APP_NAME } from '../../constants.js'
import { useAuth } from '../../hooks/useAuth.js'

export default function Header({ onToggleSidebar }) {
  const { logout } = useAuth()

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="rounded border border-border px-3 py-1 text-sm md:hidden"
            aria-label="Toggle menu"
          >
            Menu
          </button>
          <Link to="/dashboard" className="font-semibold text-foreground">
            {APP_NAME}
          </Link>
        </div>

        <nav className="hidden items-center gap-4 text-sm md:flex">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? 'text-primary' : 'text-muted')}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/orders"
            className={({ isActive }) => (isActive ? 'text-primary' : 'text-muted')}
          >
            Encomendas
          </NavLink>
          <NavLink
            to="/import"
            className={({ isActive }) => (isActive ? 'text-primary' : 'text-muted')}
          >
            Importar
          </NavLink>
        </nav>

        <button
          type="button"
          onClick={logout}
          className="rounded bg-primary px-3 py-1 text-sm text-white"
        >
          Sair
        </button>
      </div>
    </header>
  )
}
