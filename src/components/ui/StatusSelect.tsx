import { CLIENT_STATUSES, STATUS_LABELS, type StatusFilter } from '@/lib/metrics'
import { ChevronDown } from 'lucide-react'

export function StatusSelect({ value, onChange }: { value: StatusFilter; onChange: (value: StatusFilter) => void }) {
  return (
    <label className="relative flex h-11 items-center border border-[var(--line)] bg-[var(--surface)] md:w-[200px] md:shrink-0">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as StatusFilter)}
        aria-label="Filtrar por status"
        className="h-full w-full appearance-none bg-transparent pl-3.5 pr-9 text-[16px] text-[var(--bone)] outline-none md:text-[14px]"
      >
        <option value="todos" className="bg-[var(--surface)]">
          Todos os status
        </option>
        {CLIENT_STATUSES.map((status) => (
          <option key={status} value={status} className="bg-[var(--surface)]">
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 size-4 text-[var(--muted)]"
        strokeWidth={1.75}
        aria-hidden="true"
      />
    </label>
  )
}
