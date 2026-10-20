import { cn } from '@/lib/cn'
import { Check, Minus } from 'lucide-react'

export type PayState = 'paid' | 'partial' | 'open'

export function payState(paidCents: number, expectedCents: number): PayState {
  if (paidCents <= 0 || expectedCents <= 0) return 'open'
  if (paidCents >= expectedCents) return 'paid'
  return 'partial'
}

export function PayBox({ state, onClick, label }: { state: PayState; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={state === 'paid'}
      aria-label={label}
      className={cn(
        'flex size-[18px] shrink-0 items-center justify-center rounded-[2px]',
        state === 'paid' && 'bg-[var(--bone)] text-[var(--ink)]',
        state === 'partial' && 'border border-[var(--partial)] text-[var(--partial)]',
        state === 'open' && 'border border-[var(--line)]',
      )}
    >
      {state === 'paid' && <Check className="size-3" strokeWidth={2.75} aria-hidden="true" />}
      {state === 'partial' && <Minus className="size-3" strokeWidth={2.75} aria-hidden="true" />}
    </button>
  )
}
