export type Installment = {
  id: string
  number: number
  dueDate: string
  expectedCents: number
  paidCents: number
  paidOn: string | null
}

export const TATTOO_ARTISTS = ['Gustavo', 'Mikari', 'Warol'] as const

export type Tattoo = {
  title: string
  description: string
  bodyLocation: string
  artist: string
  imageUrl: string
}

export type Client = {
  id: string
  name: string
  phone: string
  email: string
  instagram: string
  birthDate: string
  notes: string
  tattoo: Tattoo
  totalCents: number
  installmentCount: number
  startDate: string
  Installments: Installment[]
}

export type ClientStatus = 'atrasado' | 'em-dia' | 'quitado'

export type PaymentInput = {
  paidCents: number
  paidOn: string | null
}
