import { formatDayMonth, shiftISO, todayISO } from '@/lib/dates'
import type { Client, ClientStatus, Installment } from '@/types/client'

type LedgerItem = Pick<Installment, 'number' | 'dueDate' | 'expectedCents' | 'paidCents'>

export function remainingOf(item: Pick<Installment, 'expectedCents' | 'paidCents'>) {
  return Math.max(0, item.expectedCents - item.paidCents)
}

export function isSettled(item: Pick<Installment, 'expectedCents' | 'paidCents'>) {
  return item.expectedCents > 0 && item.paidCents >= item.expectedCents
}

export function balanceOf(Installments: LedgerItem[]) {
  return Installments.reduce((sum, item) => sum + remainingOf(item), 0)
}

export function receivedOf(Installments: LedgerItem[]) {
  return Installments.reduce((sum, item) => sum + Math.max(0, item.paidCents), 0)
}

export function overdueOf(Installments: LedgerItem[], today: string) {
  return Installments
    .filter((item) => item.dueDate < today && !isSettled(item))
    .reduce((sum, item) => sum + remainingOf(item), 0)
}

export function paidCountOf(Installments: LedgerItem[]) {
  return Installments.filter(isSettled).length
}

export function nextOpenInstallment(Installments: LedgerItem[]) {
  return [...Installments]
    .filter((item) => item.paidCents <= 0)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.number - b.number)[0]
}

export function nextOnTimeInstallment(Installments: LedgerItem[], today: string) {
  return [...Installments]
    .filter((item) => item.dueDate >= today && !isSettled(item))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.number - b.number)[0]
}

export function statusOf(totalCents: number, Installments: LedgerItem[], today: string): ClientStatus {
  if (totalCents > 0 && balanceOf(Installments) <= 0) return 'quitado'
  if (overdueOf(Installments, today) > 0) return 'atrasado'
  return 'em-dia'
}

export function clientBalance(client: Client) {
  return balanceOf(client.Installments)
}

export function clientStatus(client: Client, today = todayISO()) {
  return statusOf(client.totalCents, client.Installments, today)
}

export function joinNames(names: string[]) {
  if (names.length <= 1) return names[0] ?? ''
  if (names.length === 2) return `${names[0]} e ${names[1]}`
  return `${names.slice(0, -1).join(', ')} e ${names.at(-1)}`
}

export type StudioSummary = {
  openCents: number
  payingCount: number
  payingDetail: string
  overdueCents: number
  overdueDetail: string
  dueTomorrowCents: number
  dueTomorrowDetail: string
}

export function studioSummary(clients: Client[], today = todayISO()): StudioSummary {
  const paying = clients.filter((client) => clientBalance(client) > 0)
  const overdue = clients.filter((client) => overdueOf(client.Installments, today) > 0)
  const tomorrow = shiftISO(today, 1)
  const dueTomorrow = clients.flatMap((client) =>
    client.Installments
      .filter((item) => item.dueDate === tomorrow && !isSettled(item))
      .map((item) => ({ client, item })),
  )

  const dueNames = [...new Set(dueTomorrow.map((row) => row.client.name))]
  const payingDetail =
    paying.length === 0
      ? 'Nenhum cliente em aberto'
      : paying.length === 1
        ? '1 cliente ainda pagando'
        : `${paying.length} clientes ainda pagando`

  return {
    openCents: paying.reduce((sum, client) => sum + clientBalance(client), 0),
    payingCount: paying.length,
    payingDetail,
    overdueCents: overdue.reduce((sum, client) => sum + overdueOf(client.Installments, today), 0),
    overdueDetail: joinNames(overdue.map((client) => client.name.split(' ')[0] ?? client.name)) || 'Ninguém',
    dueTomorrowCents: dueTomorrow.reduce((sum, row) => sum + remainingOf(row.item), 0),
    dueTomorrowDetail: dueNames.length
      ? `${joinNames(dueNames)} · ${formatDayMonth(dueTomorrow[0]?.item.dueDate ?? tomorrow)}`
      : 'Nenhuma cobrança',
  }
}

export const CLIENT_STATUSES: ClientStatus[] = ['atrasado', 'em-dia', 'quitado']

export const STATUS_LABELS: Record<ClientStatus, string> = {
  atrasado: 'Atrasado',
  'em-dia': 'Em dia',
  quitado: 'Quitado',
}

export type StatusFilter = 'todos' | ClientStatus

export function matchesStatus(client: Client, filter: StatusFilter, today = todayISO()) {
  return filter === 'todos' || clientStatus(client, today) === filter
}

export type ArtistFilter = 'todos' | string

export function matchesArtist(client: Client, filter: ArtistFilter) {
  return filter === 'todos' || client.tattoo.artist === filter
}

export function matchesClient(client: Client, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return [
    client.name,
    client.phone,
    client.email,
    client.tattoo.title,
    client.tattoo.description,
    client.tattoo.bodyLocation,
    client.tattoo.artist,
  ]
    .join(' ')
    .toLowerCase()
    .includes(normalized)
}
