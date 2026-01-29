import { NavLink } from 'react-router-dom'

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside
      className={
        `fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-background p-4 transition-transform md:static md:translate-x-0 ` +
        (isOpen ? 'translate-x-0' : '-translate-x-full')
      }
    >
      <div className="mb-6 flex items-center justify-between md:hidden">
        <span className="text-sm font-semibold">Menu</span>
        <button type="button" onClick={onClose} className="text-sm text-muted">
          Fechar
        </button>
      </div>

      <nav className="flex flex-col gap-2 text-sm">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `rounded px-3 py-2 ${isActive ? 'bg-primary text-white' : 'text-foreground hover:bg-border'}`
          }
          onClick={onClose}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `rounded px-3 py-2 ${isActive ? 'bg-primary text-white' : 'text-foreground hover:bg-border'}`
          }
          onClick={onClose}
        >
          Encomendas
        </NavLink>
        <NavLink
          to="/import"
          className={({ isActive }) =>
            `rounded px-3 py-2 ${isActive ? 'bg-primary text-white' : 'text-foreground hover:bg-border'}`
          }
          onClick={onClose}
        >
          Importar
        </NavLink>
      </nav>
    </aside>
  )
}
