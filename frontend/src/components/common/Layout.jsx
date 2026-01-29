import { Outlet } from 'react-router-dom'
import { useCallback, useState } from 'react'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'
import Footer from './Footer.jsx'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onToggleSidebar={toggleSidebar} />

      <div className="mx-auto grid max-w-6xl grid-cols-1 md:grid-cols-[16rem_1fr]">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        <main className="min-h-[calc(100vh-3.5rem-3rem)] px-4 py-6">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  )
}
