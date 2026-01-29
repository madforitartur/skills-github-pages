import { useParams } from 'react-router-dom'

export default function OrdersPage() {
  const { id } = useParams()

  return (
    <div>
      <h1 className="text-xl font-semibold">Encomendas</h1>
      <p className="mt-2 text-sm text-muted">{id ? `Detalhe: ${id}` : '(a implementar)'}</p>
    </div>
  )
}
