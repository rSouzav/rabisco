import { cn } from '@/lib/cn'
import { STATUS_LABELS } from '@/lib/metrics'
import type { ClientStatus } from '@/types/client'

const PRESENTATION: Record<ClientStatus, string> = {
  atrasado:
    'text-[var(--status-overdue)] border-[color-mix(in_srgb,var(--status-overdue)_45%,transparent)] bg-[color-mix(in_srgb,var(--status-overdue)_14%,transparent)]',
  'em-dia':
    'text-[var(--status-ok)] border-[color-mix(in_srgb,var(--status-ok)_40%,transparent)] bg-[color-mix(in_srgb,var(--status-ok)_12%,transparent)]',
  quitado:
    'text-[var(--status-paid)] border-[color-mix(in_srgb,var(--status-paid)_40%,transparent)] bg-[color-mix(in_srgb,var(--status-paid)_12%,transparent)]',
}

export function StatusBadge({ status, className }: { status: ClientStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-[13px] whitespace-nowrap',
        PRESENTATION[status],
        className,
      )}
    >
      <span className="size-[7px] shrink-0 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </span>
  )
}
