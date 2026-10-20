import type { Client, Installment } from '@/types/client'
import { supabase } from '../../utils/supabase'

type ClientRow = {
  id: string
  name: string | null
  phone: string | null
  email: string | null
  instagram: string | null
  birth_date: string | null
  notes: string | null
  tattoo_title: string | null
  tattoo_description: string | null
  tattoo_body_location: string | null
  tattoo_artist: string | null
  tattoo_image_url: string | null
  total_cents: number | null
  installment_count: number | null
  start_date: string
}

type InstallmentRow = {
  id: string
  client_id: string
  number: number
  due_date: string
  expected_cents: number
  paid_cents: number | null
  paid_on: string | null
}

function rowToInstallment(row: InstallmentRow): Installment {
  return {
    id: row.id,
    number: row.number,
    dueDate: row.due_date,
    expectedCents: row.expected_cents,
    paidCents: row.paid_cents ?? 0,
    paidOn: row.paid_on,
  }
}

function rowToClient(row: ClientRow, Installments: Installment[]): Client {
  return {
    id: row.id,
    name: row.name ?? '',
    phone: row.phone ?? '',
    email: row.email ?? '',
    instagram: row.instagram ?? '',
    birthDate: row.birth_date ?? '',
    notes: row.notes ?? '',
    tattoo: {
      title: row.tattoo_title ?? '',
      description: row.tattoo_description ?? '',
      bodyLocation: row.tattoo_body_location ?? '',
      artist: row.tattoo_artist ?? '',
      imageUrl: row.tattoo_image_url ?? '',
    },
    totalCents: row.total_cents ?? 0,
    installmentCount: row.installment_count ?? Installments.length,
    startDate: row.start_date,
    Installments,
  }
}

function clientToRow(client: Client): ClientRow {
  return {
    id: client.id,
    name: client.name,
    phone: client.phone,
    email: client.email,
    instagram: client.instagram,
    birth_date: client.birthDate || null,
    notes: client.notes,
    tattoo_title: client.tattoo.title,
    tattoo_description: client.tattoo.description,
    tattoo_body_location: client.tattoo.bodyLocation,
    tattoo_artist: client.tattoo.artist || null,
    tattoo_image_url: client.tattoo.imageUrl,
    total_cents: client.totalCents,
    installment_count: client.installmentCount,
    start_date: client.startDate,
  }
}

function installmentToRow(clientId: string, item: Installment): InstallmentRow {
  return {
    id: item.id,
    client_id: clientId,
    number: item.number,
    due_date: item.dueDate,
    expected_cents: item.expectedCents,
    paid_cents: item.paidCents,
    paid_on: item.paidOn,
  }
}

export async function fetchClients(): Promise<Client[]> {
  const [clientsResult, InstallmentsResult] = await Promise.all([
    supabase.from('Clients').select('*').order('name'),
    supabase.from('Installments').select('*').order('number'),
  ])
  if (clientsResult.error) throw clientsResult.error
  if (InstallmentsResult.error) throw InstallmentsResult.error

  const byClient = new Map<string, Installment[]>()
  for (const row of InstallmentsResult.data as InstallmentRow[]) {
    const list = byClient.get(row.client_id) ?? []
    list.push(rowToInstallment(row))
    byClient.set(row.client_id, list)
  }

  return (clientsResult.data as ClientRow[]).map((row) => rowToClient(row, byClient.get(row.id) ?? []))
}

export async function upsertClient(client: Client) {
  const { error: clientError } = await supabase.from('Clients').upsert(clientToRow(client))
  if (clientError) throw clientError

  const ids = client.Installments.map((item) => item.id)
  const { error: staleError } = await supabase
    .from('Installments')
    .delete()
    .eq('client_id', client.id)
    .not('id', 'in', `(${ids.join(',')})`)
  if (staleError) throw staleError

  const rows = client.Installments.map((item) => installmentToRow(client.id, item))
  const { error: InstallmentsError } = await supabase.from('Installments').upsert(rows)
  if (InstallmentsError) throw InstallmentsError
}

export async function removeClient(id: string) {
  const { error: InstallmentsError } = await supabase.from('Installments').delete().eq('client_id', id)
  if (InstallmentsError) throw InstallmentsError

  const { error } = await supabase.from('Clients').delete().eq('id', id)
  if (error) throw error
}
