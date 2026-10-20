import { formatSlashDate, parseSlashDate, todayISO } from '@/lib/dates'
import { maskPhoneFinal } from '@/lib/mask'
import { balanceOf, nextOnTimeInstallment, overdueOf, receivedOf, statusOf } from '@/lib/metrics'
import { formatMoney, parseMoney } from '@/lib/money'
import { buildInstallments, clampTimes } from '@/lib/schedule'
import type { Client, ClientStatus, Installment } from '@/types/client'

export type DraftInstallment = {
  id: string
  number: number
  dueDate: string
  expectedCents: number
  paidText: string
  paidOnText: string
}

export type ClientDraft = {
  name: string
  phone: string
  email: string
  instagram: string
  birthDate: string
  notes: string
  title: string
  description: string
  bodyLocation: string
  artist: string
  imageUrl: string
  total: string
  times: string
  monthly: string
  startDate: string
  Installments: DraftInstallment[]
}

export type DraftView = {
  totalCents: number
  balanceCents: number
  overdueCents: number
  receivedCents: number
  monthlyCents: number
  status: ClientStatus
  nextOnTime: { dueDate: string; expectedCents: number } | null
}

function toDraftInstallment(item: Installment): DraftInstallment {
  return {
    id: item.id,
    number: item.number,
    dueDate: item.dueDate,
    expectedCents: item.expectedCents,
    paidText: formatMoney(item.paidCents, 'precise'),
    paidOnText: item.paidOn ? formatSlashDate(item.paidOn) : '',
  }
}

export function clientToDraft(client: Client): ClientDraft {
  const times = client.Installments.length || client.installmentCount || 1
  return {
    name: client.name,
    phone: maskPhoneFinal(client.phone),
    email: client.email,
    instagram: client.instagram,
    birthDate: client.birthDate ? formatSlashDate(client.birthDate) : '',
    notes: client.notes,
    title: client.tattoo.title,
    description: client.tattoo.description,
    bodyLocation: client.tattoo.bodyLocation,
    artist: client.tattoo.artist,
    imageUrl: client.tattoo.imageUrl,
    total: formatMoney(client.totalCents, 'precise'),
    times: String(times),
    monthly: formatMoney(times ? Math.round(client.totalCents / times) : 0, 'precise'),
    startDate: formatSlashDate(client.startDate),
    Installments: client.Installments.map(toDraftInstallment),
  }
}

export function emptyDraft(): ClientDraft {
  const startDate = todayISO()
  const blank: Client = {
    id: '',
    name: '',
    phone: '',
    email: '',
    instagram: '',
    birthDate: '',
    notes: '',
    tattoo: { title: '', description: '', bodyLocation: '', artist: '', imageUrl: '' },
    totalCents: 0,
    installmentCount: 1,
    startDate,
    Installments: buildInstallments({ totalCents: 0, count: 1, startDate }),
  }
  return clientToDraft(blank)
}

export function createId() {
  return `c_${crypto.randomUUID()}`
}

export function viewDraft(draft: ClientDraft, today = todayISO()): DraftView {
  const Installments = draft.Installments.map((item) => ({
    number: item.number,
    dueDate: item.dueDate,
    expectedCents: item.expectedCents,
    paidCents: Math.min(parseMoney(item.paidText), item.expectedCents),
  }))
  const times = clampTimes(draft.times)
  const totalCents = parseMoney(draft.total)
  const next = nextOnTimeInstallment(Installments, today)

  return {
    totalCents,
    balanceCents: balanceOf(Installments),
    overdueCents: overdueOf(Installments, today),
    receivedCents: receivedOf(Installments),
    monthlyCents: times ? Math.round(totalCents / times) : 0,
    status: statusOf(totalCents, Installments, today),
    nextOnTime: next ? { dueDate: next.dueDate, expectedCents: next.expectedCents } : null,
  }
}

export function applySchedule(draft: ClientDraft, source: 'total' | 'times' | 'monthly' | 'start'): ClientDraft {
  if (source === 'start' && !parseSlashDate(draft.startDate)) return draft

  const times = clampTimes(draft.times)
  const totalCents = source === 'monthly' ? parseMoney(draft.monthly) * times : parseMoney(draft.total)
  const startDate = parseSlashDate(draft.startDate) ?? todayISO()
  const Installments = buildInstallments({
    totalCents,
    count: times,
    startDate,
    previous: draft.Installments.map((item) => ({
      id: item.id,
      number: item.number,
      paidCents: parseMoney(item.paidText),
      paidOn: parseSlashDate(item.paidOnText),
    })),
  })

  return {
    ...draft,
    times: String(times),
    total: formatMoney(totalCents, 'precise'),
    monthly: formatMoney(times ? Math.round(totalCents / times) : 0, 'precise'),
    startDate: formatSlashDate(startDate),
    Installments: Installments.map(toDraftInstallment),
  }
}

export function draftToClient(draft: ClientDraft, id: string): Client {
  const scheduled = applySchedule(draft, 'total')
  const startDate = parseSlashDate(scheduled.startDate) ?? todayISO()
  const title =
    scheduled.title.trim() || scheduled.bodyLocation.trim() || scheduled.description.trim().slice(0, 48) || 'Sem tatuagem'

  return {
    id,
    name: scheduled.name.trim(),
    phone: maskPhoneFinal(scheduled.phone),
    email: scheduled.email.trim(),
    instagram: scheduled.instagram.trim(),
    birthDate: parseSlashDate(scheduled.birthDate) ?? '',
    notes: scheduled.notes.trim(),
    tattoo: {
      title,
      description: scheduled.description.trim(),
      bodyLocation: scheduled.bodyLocation.trim(),
      artist: scheduled.artist,
      imageUrl: scheduled.imageUrl,
    },
    totalCents: parseMoney(scheduled.total),
    installmentCount: scheduled.Installments.length,
    startDate,
    Installments: buildInstallments({
      totalCents: parseMoney(scheduled.total),
      count: scheduled.Installments.length,
      startDate,
      previous: scheduled.Installments.map((item) => ({
        id: item.id,
        number: item.number,
        paidCents: parseMoney(item.paidText),
        paidOn: parseSlashDate(item.paidOnText),
      })),
    }),
  }
}
