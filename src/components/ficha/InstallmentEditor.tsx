import { PayBox, payState } from '@/components/ficha/PayBox'
import { formatShortDate } from '@/lib/dates'
import type { DraftInstallment } from '@/lib/draft'
import { cn } from '@/lib/cn'
import { formatMoney, parseMoney } from '@/lib/money'

type InstallmentEditorProps = {
  items: DraftInstallment[]
  today: string
  onToggle: (number: number) => void
  onPaidChange: (number: number, value: string) => void
  onPaidBlur: (number: number) => void
  onDateChange: (number: number, value: string) => void
}

export function InstallmentEditor(props: InstallmentEditorProps) {
  return (
    <>
      <InstallmentTable {...props} />
      <InstallmentCards {...props} />
    </>
  )
}

function InstallmentTable({ items, today, onToggle, onPaidChange, onPaidBlur, onDateChange }: InstallmentEditorProps) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[860px] border-collapse text-left">
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
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const paidCents = Math.min(parseMoney(item.paidText), item.expectedCents)
            const state = payState(paidCents, item.expectedCents)
            const overdue = item.dueDate < today && state !== 'paid'
            const situation = situationCopy(paidCents, item.expectedCents, overdue, 'table')
            const number = String(item.number).padStart(2, '0')

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
                <td className="px-2.5">
                  <CellInput
                    value={item.paidText}
                    label={`Valor pago da parcela ${number}`}
                    muted={paidCents === 0}
                    onChange={(value) => onPaidChange(item.number, value)}
                    onBlur={() => onPaidBlur(item.number)}
                  />
                </td>
                <td className="px-2.5">
                  <CellInput
                    value={item.paidOnText}
                    label={`Data de pagamento da parcela ${number}`}
                    placeholder="dd/mm/aaaa"
                    onChange={(value) => onDateChange(item.number, value)}
                  />
                </td>
                <td className={cn('px-2.5 text-[13px]', situation.className)}>{situation.label}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function InstallmentCards({ items, today, onToggle, onPaidChange, onPaidBlur, onDateChange }: InstallmentEditorProps) {
  return (
    <div className="md:hidden">
      {items.map((item) => {
        const paidCents = Math.min(parseMoney(item.paidText), item.expectedCents)
        const state = payState(paidCents, item.expectedCents)
        const overdue = item.dueDate < today && state !== 'paid'
        const situation = situationCopy(paidCents, item.expectedCents, overdue, 'card')
        const number = String(item.number).padStart(2, '0')

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
            <InlineField
              label="Valor pago"
              value={item.paidText}
              muted={paidCents === 0}
              onChange={(value) => onPaidChange(item.number, value)}
              onBlur={() => onPaidBlur(item.number)}
            />
            <InlineField
              label="Pago em"
              value={item.paidOnText}
              placeholder="dd/mm/aaaa"
              onChange={(value) => onDateChange(item.number, value)}
            />
          </article>
        )
      })}
    </div>
  )
}

function CellInput({
  value,
  label,
  placeholder,
  muted = false,
  onChange,
  onBlur,
}: {
  value: string
  label: string
  placeholder?: string
  muted?: boolean
  onChange: (value: string) => void
  onBlur?: () => void
}) {
  return (
    <input
      value={value}
      aria-label={label}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      className={cn(
        'h-9 w-full border border-[var(--line)] bg-[var(--surface)] px-2.5 text-[13px] outline-none placeholder:text-[var(--muted)] focus:border-[var(--bone)]',
        muted ? 'text-[var(--muted)]' : 'text-[var(--bone)]',
      )}
    />
  )
}

function InlineField({
  label,
  value,
  placeholder,
  muted = false,
  onChange,
  onBlur,
}: {
  label: string
  value: string
  placeholder?: string
  muted?: boolean
  onChange: (value: string) => void
  onBlur?: () => void
}) {
  return (
    <label className="flex h-11 items-center justify-between gap-3 border border-[var(--line)] bg-[var(--surface)] px-3">
      <span className="text-[13px] text-[var(--muted)]">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className={cn(
          'w-[46%] bg-transparent text-right text-[16px] outline-none placeholder:text-[var(--muted)]',
          muted ? 'text-[var(--muted)]' : 'text-[var(--bone)]',
        )}
      />
    </label>
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
