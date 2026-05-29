import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { AuthLayout } from './layouts/AuthLayout'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'

import { LoginPage } from '@/pages/auth/LoginPage'
import { CalendarPage } from '@/pages/calendar/CalendarPage'
import { MemoryDetailPage } from '@/pages/memory/MemoryDetailPage'
import { CreateMemoryPage } from '@/pages/memory/CreateMemoryPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { StatsPage } from '@/pages/stats/StatsPage'
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
    ],
  },
  {
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: [
      { path: '/', element: <CalendarPage /> },
      { path: '/memory/create', element: <CreateMemoryPage /> },
      { path: '/memory/:date', element: <MemoryDetailPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/stats', element: <StatsPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
