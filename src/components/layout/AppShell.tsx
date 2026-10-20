import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { Outlet } from 'react-router-dom'

export function AppShell() {
  return (
    <div className="flex h-full bg-[var(--bg)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="min-h-0 min-w-0 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
