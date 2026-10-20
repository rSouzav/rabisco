import type { ArtistFilter } from '@/lib/metrics'
import { TATTOO_ARTISTS } from '@/types/client'
import { ChevronDown } from 'lucide-react'

export function ArtistSelect({ value, onChange }: { value: ArtistFilter; onChange: (value: ArtistFilter) => void }) {
  return (
    <label className="relative flex h-11 items-center border border-[var(--line)] bg-[var(--surface)] md:w-[200px] md:shrink-0">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Filtrar por tatuador"
        className="h-full w-full appearance-none bg-transparent pl-3.5 pr-9 text-[16px] text-[var(--bone)] outline-none md:text-[14px]"
      >
        <option value="todos" className="bg-[var(--surface)]">
          Todos os tatuadores
        </option>
        {TATTOO_ARTISTS.map((artist) => (
          <option key={artist} value={artist} className="bg-[var(--surface)]">
            {artist}
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
