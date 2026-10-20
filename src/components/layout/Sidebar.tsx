import { useStudio } from '@/context/StudioContext'
import { LogOut, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Sidebar() {
  const { userName, logout } = useStudio()

  return (
    <aside className="hidden h-full w-[232px] shrink-0 flex-col justify-between border-r border-[var(--line)] bg-[var(--sidebar)] px-5 py-7 xl:flex">
      <div className="flex flex-col gap-7">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="" className="size-11 rounded-full object-cover" />
          <div className="flex flex-col gap-0.5">
            <span className="font-display text-[15px] leading-none">Rabisco Ink</span>
            <span className="text-[11px] text-[var(--muted)]">Since 2015</span>
          </div>
        </div>
        <nav aria-label="Seções" className="flex flex-col gap-1">
          <Link
            to="/clientes"
            className="flex h-10 items-center gap-2.5 bg-[var(--nav)] px-3 text-[14px] font-semibold text-[var(--bone)]"
          >
            <Users className="size-4" strokeWidth={1.75} aria-hidden="true" />
            Clientes
          </Link>
        </nav>
      </div>
      <div className="flex flex-col gap-3.5">
        <p className="text-[13px]">{userName}</p>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 text-[13px] text-[var(--muted)]"
        >
          <LogOut className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
          Sair
        </button>
      </div>
    </aside>
  )
}
