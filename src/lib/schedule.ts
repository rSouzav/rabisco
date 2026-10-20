import { addMonths } from '@/lib/dates'
import type { Installment } from '@/types/client'

export function clampTimes(value: string) {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 1) return 1
  return Math.min(24, parsed)
}

export function buildInstallments(input: {
  totalCents: number
  count: number
  startDate: string
  previous?: Array<Pick<Installment, 'id' | 'number' | 'paidCents' | 'paidOn'>>
}): Installment[] {
  const count = Math.min(24, Math.max(1, Math.floor(input.count) || 1))
  const total = Math.max(0, Math.round(input.totalCents))
  const base = Math.floor(total / count)
  const remainder = total - base * count

  return Array.from({ length: count }, (_, index) => {
    const number = index + 1
    const previous = input.previous?.find((item) => item.number === number)
    const expectedCents = base + (index === count - 1 ? remainder : 0)
    const paidCents = Math.min(Math.max(0, previous?.paidCents ?? 0), expectedCents)

    return {
      id: previous?.id ?? crypto.randomUUID(),
      number,
      dueDate: addMonths(input.startDate, index),
      expectedCents,
      paidCents,
      paidOn: paidCents > 0 ? (previous?.paidOn ?? null) : null,
    }
  })
}
