# Frontend (React + Vite)

## Requisitos

- Node.js 18+

## Setup

```bash
cd frontend
npm install
npm run dev
```

A app ficará disponível em `http://localhost:5173`.

## Proxy para o backend

Durante o desenvolvimento, chamadas para `/api/*` são encaminhadas para `http://localhost:5000` via `vite.config.js`.

Exemplo:

- Frontend: `GET /api/orders`
- Backend: `http://localhost:5000/api/orders`

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste conforme necessário:

```bash
cp .env.example .env
```

## Estrutura

- `src/components/common`: layout base (Header/Sidebar/Footer/Layout)
- `src/components/pages`: páginas (Login, Dashboard, Orders, Import, 404)
- `src/context`: `AuthContext` e provider
- `src/hooks`: hooks de domínio (`useAuth`, `useOrders`)
- `src/services`: camada de API (`api`, `authService`, `ordersService`)
- `src/styles`: estilos globais + Tailwind
