import { useStudio } from '@/context/StudioContext'
import { ChevronLeft, LogOut, Users } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export function TopBar() {
  const { pathname } = useLocation()
  const onFile = /^\/clientes\/.+/.test(pathname)
  return onFile ? <FileBar /> : <ClientsBar />
}

function ClientsBar() {
  const { logout } = useStudio()

  return (
    <header className="flex h-[60px] items-center justify-between border-b border-[var(--line)] bg-[var(--sidebar)] px-4 xl:hidden md:h-16">
      <div className="flex min-w-0 items-center gap-3">
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" className="size-8 rounded-full object-cover md:size-9" />
        <span className="truncate font-display text-[15px]">Rabisco Ink</span>
        <Link
          to="/clientes"
          className="ml-1 hidden h-8 items-center gap-2 bg-[var(--nav)] px-3 text-[14px] font-semibold md:inline-flex"
        >
          <Users className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
          Clientes
        </Link>
      </div>
      <button
        type="button"
        onClick={logout}
        className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-[var(--muted)] transition-colors hover:text-[var(--bone)]"
      >
        <LogOut className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
        Sair
      </button>
    </header>
  )
}

function FileBar() {
  return (
    <header className="flex h-14 items-center border-b border-[var(--line)] bg-[var(--sidebar)] px-4 xl:hidden md:h-16">
      <div className="flex min-w-0 items-center gap-3">
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" className="hidden size-9 rounded-full object-cover md:block" />
        <span className="hidden font-display text-[15px] md:inline">Rabisco Ink</span>
        <Link
          to="/clientes"
          className="inline-flex items-center gap-1.5 text-[14px] text-[var(--bone)] md:h-8 md:bg-[var(--nav)] md:px-3 md:font-semibold"
        >
          <ChevronLeft className="size-4 md:size-3.5" strokeWidth={1.75} aria-hidden="true" />
          Clientes
        </Link>
      </div>
    </header>
  )
}
