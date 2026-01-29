import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/common/Layout.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'

import LoginPage from './components/pages/LoginPage.jsx'
import DashboardPage from './components/pages/DashboardPage.jsx'
import OrdersPage from './components/pages/OrdersPage.jsx'
import ImportPage from './components/pages/ImportPage.jsx'
import NotFoundPage from './components/pages/NotFoundPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrdersPage />} />
          <Route path="/import" element={<ImportPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
