import { ClientCards, ClientTable } from '@/components/clients/ClientList'
import { SummaryMetrics } from '@/components/clients/SummaryMetrics'
import { Button } from '@/components/ui/Button'
import { SearchField } from '@/components/ui/SearchField'
import { ArtistSelect } from '@/components/ui/ArtistSelect'
import { StatusSelect } from '@/components/ui/StatusSelect'
import { useStudio } from '@/context/StudioContext'
import {
  matchesArtist,
  matchesClient,
  matchesStatus,
  studioSummary,
  type ArtistFilter,
  type StatusFilter,
} from '@/lib/metrics'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function ClientsPage() {
  const { clients, clientsLoading, clientsError } = useStudio()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('todos')
  const [artist, setArtist] = useState<ArtistFilter>('todos')
  const summary = useMemo(() => studioSummary(clients), [clients])
  const visible = useMemo(
    () =>
      clients.filter(
        (client) => matchesClient(client, query) && matchesStatus(client, status) && matchesArtist(client, artist),
      ),
    [clients, query, status, artist],
  )

  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-7 md:py-7 xl:px-9 xl:py-9">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex max-w-[640px] flex-col gap-1.5">
          <h1 className="font-display text-[32px] leading-none md:text-[40px]">Clientes</h1>
          <p className="text-[14px] text-[var(--muted)] md:hidden">Quanto ainda falta receber de cada um.</p>
          <p className="hidden text-[14px] text-[var(--muted)] md:block">
            Quem está tatuando e quanto ainda falta receber.
          </p>
        </div>
        <Button className="h-12 w-full md:h-11 md:w-auto" onClick={() => navigate('/clientes/novo')}>
          <Plus className="size-4" strokeWidth={1.75} aria-hidden="true" />
          Novo cliente
        </Button>
      </header>

      <SummaryMetrics summary={summary} />
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="min-w-0 flex-1">
          <SearchField value={query} onChange={setQuery} />
        </div>
        <StatusSelect value={status} onChange={setStatus} />
        <ArtistSelect value={artist} onChange={setArtist} />
      </div>

      {clientsError ? (
        <p className="border-b border-[var(--line)] py-8 text-[14px] text-[var(--overdue)]">{clientsError}</p>
      ) : clientsLoading ? (
        <p className="border-b border-[var(--line)] py-8 text-[14px] text-[var(--muted)]">Carregando clientes…</p>
      ) : visible.length === 0 ? (
        <p className="border-b border-[var(--line)] py-8 text-[14px] text-[var(--muted)]">Nenhum cliente encontrado.</p>
      ) : (
        <>
          <ClientTable clients={visible} />
          <ClientCards clients={visible} />
        </>
      )}
    </div>
  )
}
