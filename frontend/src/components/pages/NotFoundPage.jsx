import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4">
      <h1 className="text-2xl font-semibold">404</h1>
      <p className="mt-2 text-sm text-muted">Página não encontrada.</p>
      <div className="mt-4">
        <Link className="text-primary underline" to="/login">
          Ir para Login
        </Link>
      </div>
    </div>
  )
}
