import {
  applySchedule,
  clientToDraft,
  distributePayment,
  emptyDraft,
  viewDraft,
  withdrawPayment,
  type ClientDraft,
  type PaymentMove,
} from '@/lib/draft'
import { formatSlashDate, todayISO } from '@/lib/dates'
import { maskPhoneFinal } from '@/lib/mask'
import { formatMoney, parseMoney } from '@/lib/money'
import type { Client } from '@/types/client'
import { useMemo, useState } from 'react'

type TextKey = Exclude<keyof ClientDraft, 'Installments'>

export function useClientDraft(client: Client | null) {
  const [draft, setDraft] = useState<ClientDraft>(() => (client ? clientToDraft(client) : emptyDraft()))
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const today = todayISO()
  const view = useMemo(() => viewDraft(draft, today), [draft, today])

  function markDirty() {
    setSaved(false)
    setError(null)
  }

  function update(key: TextKey, value: string) {
    markDirty()
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function movePayment(kind: 'pay' | 'withdraw', cents: number): PaymentMove {
    const move =
      kind === 'pay'
        ? distributePayment(draft.Installments, cents, today)
        : withdrawPayment(draft.Installments, cents)
    if (move.ok) {
      markDirty()
      setDraft((current) => ({ ...current, Installments: move.Installments }))
    }
    return move
  }

  function blurPhone() {
    setDraft((current) => ({ ...current, phone: maskPhoneFinal(current.phone) }))
  }

  function blurSchedule(source: 'total' | 'times' | 'monthly' | 'start') {
    setDraft((current) => applySchedule(current, source))
  }

  function togglePaid(number: number) {
    markDirty()
    setDraft((current) => ({
      ...current,
      Installments: current.Installments.map((item) => {
        if (item.number !== number) return item
        const paid = Math.min(parseMoney(item.paidText), item.expectedCents)
        const settled = item.expectedCents > 0 && paid >= item.expectedCents
        if (settled) return { ...item, paidText: formatMoney(0, 'precise'), paidOnText: '' }
        return {
          ...item,
          paidText: formatMoney(item.expectedCents, 'precise'),
          paidOnText: item.paidOnText || formatSlashDate(today),
        }
      }),
    }))
  }

  function setImage(imageUrl: string) {
    markDirty()
    setDraft((current) => ({ ...current, imageUrl }))
  }

  return {
    draft,
    view,
    error,
    saved,
    today,
    update,
    blurPhone,
    movePayment,
    blurSchedule,
    togglePaid,
    setImage,
    setError,
    markSaved: () => setSaved(true),
  }
}
