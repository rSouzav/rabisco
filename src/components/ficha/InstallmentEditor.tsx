import { PayBox, payState } from '@/components/ficha/PayBox'
import { formatShortDate } from '@/lib/dates'
import type { DraftInstallment } from '@/lib/draft'
import { cn } from '@/lib/cn'
import { formatMoney, parseMoney } from '@/lib/money'
import { overdueReminder, whatsappLink } from '@/lib/whatsapp'
import { MessageCircle } from 'lucide-react'

type InstallmentEditorProps = {
  items: DraftInstallment[]
  today: string
  clientName: string
  phone: string
  onToggle: (number: number) => void
}

export function InstallmentEditor(props: InstallmentEditorProps) {
  return (
    <>
      <InstallmentTable {...props} />
      <InstallmentCards {...props} />
    </>
  )
}

function InstallmentTable({ items, today, clientName, phone, onToggle }: InstallmentEditorProps) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[980px] border-collapse text-left">
        <thead>
          <tr className="h-9 border-b border-[var(--line)] text-[11px] font-semibold tracking-[0.6px] text-[var(--muted)]">
            <th scope="col" className="w-16 px-2.5 font-semibold">
              PAGA
            </th>
            <th scope="col" className="w-[72px] px-2.5 font-semibold">
              Nº
            </th>
            <th scope="col" className="w-[150px] px-2.5 font-semibold">
              VENCIMENTO
            </th>
            <th scope="col" className="w-[140px] px-2.5 font-semibold">
              PREVISTO
            </th>
            <th scope="col" className="w-[190px] px-2.5 font-semibold">
              VALOR PAGO
            </th>
            <th scope="col" className="w-[170px] px-2.5 font-semibold">
              PAGO EM
            </th>
            <th scope="col" className="px-2.5 font-semibold">
              SITUAÇÃO
            </th>
            <th scope="col" className="w-[120px] px-2.5 font-semibold">
              COBRAR
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const paidCents = Math.min(parseMoney(item.paidText), item.expectedCents)
            const state = payState(paidCents, item.expectedCents)
            const overdue = item.dueDate < today && state !== 'paid'
            const situation = situationCopy(paidCents, item.expectedCents, overdue, 'table')
            const number = String(item.number).padStart(2, '0')
            const reminderHref = overdue ? reminderLink(clientName, phone, item, number, paidCents) : null

            return (
              <tr key={item.id} className="h-[58px] border-b border-[var(--line)]">
                <td className="px-2.5">
                  <PayBox
                    state={state}
                    onClick={() => onToggle(item.number)}
                    label={state === 'paid' ? `Desmarcar parcela ${number}` : `Marcar parcela ${number} como paga`}
                  />
                </td>
                <td className={cn('px-2.5 text-[14px]', numberTone(state, overdue))}>{number}</td>
                <td className={cn('px-2.5 text-[14px]', overdue ? 'text-[var(--overdue)]' : 'text-[var(--bone)]')}>
                  {formatShortDate(item.dueDate)}
                </td>
                <td className="px-2.5 text-[14px]">{formatMoney(item.expectedCents, 'precise')}</td>
                <td className={cn('px-2.5 text-[14px]', paidCents === 0 && 'text-[var(--muted)]')}>
                  {formatMoney(paidCents, 'precise')}
                </td>
                <td className={cn('px-2.5 text-[14px]', !item.paidOnText && 'text-[var(--muted)]')}>
                  {item.paidOnText || '—'}
                </td>
                <td className={cn('px-2.5 text-[13px]', situation.className)}>{situation.label}</td>
                <td className="px-2.5">
                  {reminderHref && <WhatsAppReminder href={reminderHref} number={number} className="h-9 px-3" />}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function InstallmentCards({ items, today, clientName, phone, onToggle }: InstallmentEditorProps) {
  return (
    <div className="md:hidden">
      {items.map((item) => {
        const paidCents = Math.min(parseMoney(item.paidText), item.expectedCents)
        const state = payState(paidCents, item.expectedCents)
        const overdue = item.dueDate < today && state !== 'paid'
        const situation = situationCopy(paidCents, item.expectedCents, overdue, 'card')
        const number = String(item.number).padStart(2, '0')
        const reminderHref = overdue ? reminderLink(clientName, phone, item, number, paidCents) : null

        return (
          <article key={item.id} className="flex flex-col gap-2 border-b border-[var(--line)] py-3">
            <div className="flex items-center gap-2">
              <PayBox
                state={state}
                onClick={() => onToggle(item.number)}
                label={state === 'paid' ? `Desmarcar parcela ${number}` : `Marcar parcela ${number} como paga`}
              />
              <span className={cn('text-[14px]', numberTone(state, overdue))}>{number}</span>
              <span className={cn('flex-1 text-[14px]', overdue ? 'text-[var(--overdue)]' : 'text-[var(--muted)]')}>
                {formatShortDate(item.dueDate)}
              </span>
              <span className={cn('text-[13px]', situation.className)}>{situation.label}</span>
            </div>
            <p className="text-[13px] text-[var(--muted)]">Previsto {formatMoney(item.expectedCents, 'precise')}</p>
            <InfoLine label="Valor pago" value={formatMoney(paidCents, 'precise')} muted={paidCents === 0} />
            <InfoLine label="Pago em" value={item.paidOnText || '—'} muted={!item.paidOnText} />
            {reminderHref && (
              <WhatsAppReminder href={reminderHref} number={number} className="h-11 w-full text-[14px]" />
            )}
          </article>
        )
      })}
    </div>
  )
}

function reminderLink(
  clientName: string,
  phone: string,
  item: DraftInstallment,
  number: string,
  paidCents: number,
) {
  return whatsappLink(
    phone,
    overdueReminder({
      name: clientName,
      number,
      dueDate: item.dueDate,
      missingCents: item.expectedCents - paidCents,
    }),
  )
}

function WhatsAppReminder({ href, number, className }: { href: string; number: string; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Cobrar parcela ${number} pelo WhatsApp`}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 bg-[var(--whatsapp)] text-[13px] font-semibold text-[var(--ink)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--bone)]',
        className,
      )}
    >
      <MessageCircle className="size-4" strokeWidth={2} aria-hidden="true" />
      WhatsApp
    </a>
  )
}

function InfoLine({ label, value, muted }: { label: string; value: string; muted: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[14px]">
      <span className="text-[var(--muted)]">{label}</span>
      <span className={muted ? 'text-[var(--muted)]' : 'text-[var(--bone)]'}>{value}</span>
    </div>
  )
}

function numberTone(state: ReturnType<typeof payState>, overdue: boolean) {
  if (state === 'paid') return 'text-[var(--muted)]'
  if (state === 'partial') return 'text-[var(--partial)]'
  if (overdue) return 'text-[var(--overdue)]'
  return 'text-[var(--bone)]'
}

function situationCopy(paidCents: number, expectedCents: number, overdue: boolean, variant: 'table' | 'card') {
  const state = payState(paidCents, expectedCents)
  if (state === 'paid') return { label: 'Paga', className: 'text-[var(--muted)]' }
  if (state === 'partial') {
    const amount = formatMoney(Math.max(0, expectedCents - paidCents))
    return {
      label: variant === 'card' ? `Falta ${amount}` : `Parcial · falta ${amount}`,
      className: 'text-[var(--partial)]',
    }
  }
  if (overdue) return { label: 'Atrasada', className: 'text-[var(--overdue)]' }
  return { label: 'Em aberto', className: 'text-[var(--bone)]' }
}
