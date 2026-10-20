import { StatusBadge } from '@/components/ui/StatusBadge'
import { cn } from '@/lib/cn'
import { formatShortDate, todayISO } from '@/lib/dates'
import { clientBalance, clientStatus, nextOpenInstallment, paidCountOf } from '@/lib/metrics'
import { formatMoney } from '@/lib/money'
import type { Client } from '@/types/client'
import { useDeleteClient } from '@/context/DeleteClientContext'
import { Eye, Trash2 } from 'lucide-react'
import type { MouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function clientPath(client: Client) {
  return `/clientes/${client.id}`
}

function useOpenClient() {
  const navigate = useNavigate()

  return (event: MouseEvent<HTMLElement>, client: Client) => {
    if ((event.target as HTMLElement).closest('a, button, input, select, textarea')) return
    if (window.getSelection()?.toString()) return
    if (event.ctrlKey || event.metaKey) {
      window.open(clientPath(client), '_blank', 'noopener')
      return
    }
    navigate(clientPath(client))
  }
}

const clickableRow = 'cursor-pointer transition-colors hover:bg-[var(--surface)]'

export function ClientTable({ clients }: { clients: Client[] }) {
  const today = todayISO()
  const openClient = useOpenClient()

  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="h-10 border-b border-[var(--line)] text-[11px] font-semibold tracking-[0.8px] text-[var(--muted)]">
            <th scope="col" className="px-3 font-semibold">
              CLIENTE
            </th>
            <th scope="col" className="hidden w-[210px] px-3 font-semibold xl:table-cell">
              TATUAGEM
            </th>
            <th scope="col" className="w-[110px] px-3 font-semibold">
              TATUADOR
            </th>
            <th scope="col" className="hidden w-[110px] px-3 font-semibold xl:table-cell">
              TOTAL
            </th>
            <th scope="col" className="hidden w-[96px] px-3 font-semibold xl:table-cell">
              PARCELAS
            </th>
            <th scope="col" className="w-[120px] px-3 font-semibold">
              SALDO
            </th>
            <th scope="col" className="w-[140px] px-3 font-semibold">
              PRÓXIMA
            </th>
            <th scope="col" className="w-[120px] px-3 font-semibold">
              STATUS
            </th>
            <th scope="col" className="w-[190px] px-3 font-semibold">
              AÇÕES
            </th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => {
            const next = nextOpenInstallment(client.Installments)
            return (
              <tr
                key={client.id}
                onClick={(event) => openClient(event, client)}
                className={cn('h-16 border-b border-[var(--line)]', clickableRow)}
              >
                <td className="px-3">
                  <div className="truncate text-[14px] font-semibold">{client.name}</div>
                  <div className="text-[12px] text-[var(--muted)]">{client.phone}</div>
                </td>
                <td className="hidden px-3 text-[14px] xl:table-cell">{client.tattoo.title}</td>
                <td className="whitespace-nowrap px-3 text-[14px]">{client.tattoo.artist || '—'}</td>
                <td className="hidden whitespace-nowrap px-3 text-[14px] xl:table-cell">
                  {formatMoney(client.totalCents)}
                </td>
                <td className="hidden whitespace-nowrap px-3 text-[14px] xl:table-cell">
                  {paidCountOf(client.Installments)} de {client.Installments.length}
                </td>
                <td className="whitespace-nowrap px-3 text-[14px]">{formatMoney(clientBalance(client))}</td>
                <td className="whitespace-nowrap px-3 text-[14px]">
                  {next ? formatShortDate(next.dueDate) : '—'}
                </td>
                <td className="px-3">
                  <StatusBadge status={clientStatus(client, today)} />
                </td>
                <td className="px-3">
                  <ClientActions client={client} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function ClientCards({ clients }: { clients: Client[] }) {
  const today = todayISO()
  const openClient = useOpenClient()

  return (
    <div className="md:hidden">
      {clients.map((client) => {
        const next = nextOpenInstallment(client.Installments)
        return (
          <article
            key={client.id}
            onClick={(event) => openClient(event, client)}
            className={cn('flex flex-col gap-1.5 border-b border-[var(--line)] py-3.5', clickableRow)}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[16px] font-semibold">{client.name}</h2>
              <StatusBadge status={clientStatus(client, today)} className="text-[12px]" />
            </div>
            <p className="text-[12px] text-[var(--muted)]">{client.phone}</p>
            <p className="text-[14px]">
              {client.tattoo.title}
              {client.tattoo.artist && (
                <>
                  <span className="text-[var(--muted)]"> · </span>
                  {client.tattoo.artist}
                </>
              )}
              <span className="text-[var(--muted)]"> · </span>
              {paidCountOf(client.Installments)} de {client.Installments.length}
            </p>
            <div className="flex items-center justify-between gap-3 text-[13px]">
              <p>Saldo {formatMoney(clientBalance(client))}</p>
              <p className="text-[var(--muted)]">{next ? formatShortDate(next.dueDate) : '—'}</p>
            </div>
            <ClientActions client={client} />
          </article>
        )
      })}
    </div>
  )
}

function ClientActions({ client }: { client: Client }) {
  const requestDelete = useDeleteClient()

  return (
    <div className="flex items-center gap-4">
      <Link
        to={clientPath(client)}
        className="inline-flex h-9 items-center gap-1.5 text-[13px] font-semibold text-[var(--bone)]"
      >
        <Eye className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
        Detalhes
      </Link>
      <button
        type="button"
        onClick={() => requestDelete(client)}
        className="-mx-2.5 inline-flex h-9 cursor-pointer items-center gap-1.5 px-2.5 text-[13px] font-semibold text-[var(--overdue)] transition-colors hover:bg-[var(--overdue)]/12"
      >
        <Trash2 className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
        Excluir
      </button>
    </div>
  )
}
