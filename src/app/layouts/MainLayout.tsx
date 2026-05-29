import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from '@/components/common/Navbar'

export function MainLayout() {
  const { pathname } = useLocation()
  const hideNavbar = pathname.startsWith('/memory/') && !pathname.includes('create')

  return (
    <div style={{ minHeight: '100vh', background: '#FAF3E4' }}>
      {!hideNavbar && <Navbar />}
      <main>
        <Outlet />
      </main>
    </div>
  )
}
