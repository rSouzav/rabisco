import { buildInstallments } from '@/lib/schedule'
import type { Client, PaymentInput, Tattoo } from '@/types/client'

type SeedInput = {
  id: string
  name: string
  phone: string
  email: string
  instagram: string
  birthDate: string
  notes: string
  tattoo: Tattoo
  totalCents: number
  startDate: string
  payments: PaymentInput[]
}

function makeClient(input: SeedInput): Client {
  const previous = input.payments.map((payment, index) => ({
    id: `${input.id}-${index + 1}`,
    number: index + 1,
    paidCents: payment.paidCents,
    paidOn: payment.paidOn,
  }))

  return {
    id: input.id,
    name: input.name,
    phone: input.phone,
    email: input.email,
    instagram: input.instagram,
    birthDate: input.birthDate,
    notes: input.notes,
    tattoo: input.tattoo,
    totalCents: input.totalCents,
    installmentCount: input.payments.length,
    startDate: input.startDate,
    Installments: buildInstallments({
      totalCents: input.totalCents,
      count: input.payments.length,
      startDate: input.startDate,
      previous,
    }),
  }
}

function openPayments(count: number, paidCount: number, amount: number, start: string): PaymentInput[] {
  return Array.from({ length: count }, (_, index) => {
    if (index >= paidCount) return { paidCents: 0, paidOn: null }
    const [year, month, day] = start.split('-').map(Number)
    const date = new Date(year, (month ?? 1) - 1 + index, day)
    const paidOn = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    return { paidCents: amount, paidOn }
  })
}

export const seedClients: Client[] = [
  makeClient({
    id: 'marina',
    name: 'Marina Costa',
    phone: '(11) 98821-4402',
    email: 'marina.costa@email.com',
    instagram: '@marinacosta',
    birthDate: '1994-03-12',
    notes: 'Prefere sessões à tarde. Pele sensível no antebraço interno.',
    tattoo: {
      title: 'Dragão no antebraço',
      description: 'Dragão blackwork no antebraço direito, do pulso ao cotovelo. Linha grossa, sem cor.',
      bodyLocation: 'Antebraço direito',
      imageUrl: `${import.meta.env.BASE_URL}marina.jpg`,
    },
    totalCents: 180_000,
    startDate: '2026-06-15',
    payments: [
      { paidCents: 30_000, paidOn: '2026-06-15' },
      { paidCents: 30_000, paidOn: '2026-07-14' },
      { paidCents: 30_000, paidOn: '2026-08-15' },
      { paidCents: 15_000, paidOn: '2026-09-16' },
      { paidCents: 0, paidOn: null },
      { paidCents: 0, paidOn: null },
    ],
  }),
  makeClient({
    id: 'lucas',
    name: 'Lucas Ferreira',
    phone: '(11) 99710-2281',
    email: 'lucas.ferreira@email.com',
    instagram: '@lucasferreira',
    birthDate: '1991-11-02',
    notes: '',
    tattoo: {
      title: 'Lettering nas costas',
      description: 'Lettering nas costas, em preto, acompanhando a coluna.',
      bodyLocation: 'Costas',
      imageUrl: '',
    },
    totalCents: 240_000,
    startDate: '2026-05-02',
    payments: openPayments(8, 5, 30_000, '2026-05-02'),
  }),
  makeClient({
    id: 'pedro',
    name: 'Pedro Henrique',
    phone: '(11) 98102-7744',
    email: 'pedro.henrique@email.com',
    instagram: '@pedrohenrique',
    birthDate: '1998-01-27',
    notes: '',
    tattoo: {
      title: 'Sleeve japonês',
      description: 'Sleeve japonês no braço, tradicional, ainda na primeira sessão.',
      bodyLocation: 'Braço',
      imageUrl: '',
    },
    totalCents: 420_000,
    startDate: '2026-09-20',
    payments: openPayments(12, 1, 35_000, '2026-09-20'),
  }),
  makeClient({
    id: 'camila',
    name: 'Camila Duarte',
    phone: '(11) 99655-0133',
    email: 'camila.duarte@email.com',
    instagram: '@camiladuarte',
    birthDate: '2000-05-19',
    notes: '',
    tattoo: {
      title: 'Fine line no pulso',
      description: 'Fine line no pulso, traço fino e único.',
      bodyLocation: 'Pulso',
      imageUrl: '',
    },
    totalCents: 45_000,
    startDate: '2026-08-03',
    payments: openPayments(1, 1, 45_000, '2026-08-03'),
  }),
  makeClient({
    id: 'ana',
    name: 'Ana Beatriz Nunes',
    phone: '(11) 99440-8820',
    email: 'ana.nunes@email.com',
    instagram: '@anabeatriz',
    birthDate: '1996-09-08',
    notes: '',
    tattoo: {
      title: 'Floral na clavícula',
      description: 'Floral na clavícula, três sessões já concluídas.',
      bodyLocation: 'Clavícula',
      imageUrl: '',
    },
    totalCents: 90_000,
    startDate: '2026-04-10',
    payments: openPayments(3, 3, 30_000, '2026-04-10'),
  }),
]
