import { AppShell } from '@/components/layout/AppShell'
import { StudioProvider, useStudio } from '@/context/StudioContext'
import { ClientFilePage } from '@/pages/ClientFilePage'
import { ClientsPage } from '@/pages/ClientsPage'
import { LoginPage } from '@/pages/LoginPage'
import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'


export function App() {
  return (
    <StudioProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<AppShell />}>
              <Route path="/clientes" element={<ClientsPage />} />
              <Route path="/clientes/:clientId" element={<ClientFilePage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </StudioProvider>
  )
}

function RequireAuth() {
  const { authReady, isAuthenticated } = useStudio()
  if (!authReady) return null
  if (!isAuthenticated) return <Navigate to="/" replace />
  return <Outlet />
}
