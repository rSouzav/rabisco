import { useMediaQuery } from '@/lib/useMediaQuery'
import { Search } from 'lucide-react'

export function SearchField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const isDesktop = useMediaQuery('(min-width: 1280px)')
  const isTablet = useMediaQuery('(min-width: 768px)')
  const placeholder = isDesktop
    ? 'Buscar por nome, telefone ou tatuagem'
    : isTablet
      ? 'Buscar por nome ou tatuagem'
      : 'Buscar cliente'

  return (
    <label className="flex h-11 items-center gap-2.5 border border-[var(--line)] bg-[var(--surface)] px-3.5">
      <Search className="size-4 shrink-0 text-[var(--muted)]" strokeWidth={1.75} aria-hidden="true" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Buscar clientes"
        className="min-w-0 flex-1 bg-transparent text-[16px] text-[var(--bone)] outline-none placeholder:text-[var(--muted)] md:text-[14px]"
      />
    </label>
  )
}
