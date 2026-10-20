import { formatMoney } from '@/lib/money'
import type { StudioSummary } from '@/lib/metrics'

export function SummaryMetrics({ summary }: { summary: StudioSummary }) {
  return (
    <section className="grid grid-cols-3 gap-2 xl:gap-8" aria-label="Resumo financeiro">
      <Metric
        mobileLabel="EM ABERTO"
        tabletLabel="EM ABERTO"
        desktopLabel="SALDO EM ABERTO"
        value={formatMoney(summary.openCents)}
        detail={summary.payingDetail}
      />
      <Metric
        mobileLabel="ATRASO"
        tabletLabel="ATRASADO"
        desktopLabel="ATRASADO"
        value={formatMoney(summary.overdueCents)}
        detail={summary.overdueDetail}
      />
      <Metric
        mobileLabel="AMANHÃ"
        tabletLabel="VENCE AMANHÃ"
        desktopLabel="VENCE AMANHÃ"
        value={formatMoney(summary.dueTomorrowCents)}
        detail={summary.dueTomorrowDetail}
      />
    </section>
  )
}

function Metric({
  mobileLabel,
  tabletLabel,
  desktopLabel,
  value,
  detail,
}: {
  mobileLabel: string
  tabletLabel: string
  desktopLabel: string
  value: string
  detail: string
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className="text-[11px] tracking-[1px] text-[var(--muted)] md:text-[12px]">
        <span className="md:hidden">{mobileLabel}</span>
        <span className="hidden md:inline xl:hidden">{tabletLabel}</span>
        <span className="hidden xl:inline">{desktopLabel}</span>
      </p>
      <p className="font-display text-[22px] leading-none text-[var(--bone)] md:text-[26px] xl:text-[28px]">{value}</p>
      <p className="hidden truncate text-[13px] text-[var(--muted)] xl:block">{detail}</p>
    </div>
  )
}
