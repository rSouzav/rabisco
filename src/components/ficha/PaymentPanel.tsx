import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import type { PaymentMove } from '@/lib/draft'
import { formatMoney, parseMoney } from '@/lib/money'
import { Check, Undo2 } from 'lucide-react'
import { useState, type KeyboardEvent } from 'react'

type PaymentPanelProps = {
  onMove: (kind: 'pay' | 'withdraw', cents: number) => PaymentMove
}

type Feedback = { tone: 'ok' | 'error'; text: string }

export function PaymentPanel({ onMove }: PaymentPanelProps) {
  const [value, setValue] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  function submit(kind: 'pay' | 'withdraw') {
    const cents = parseMoney(value)
    const move = onMove(kind, cents)
    if (!move.ok) {
      setFeedback({ tone: 'error', text: move.error })
      return
    }
    const amount = formatMoney(cents, 'precise')
    const where = installmentList(move.numbers)
    setFeedback({
      tone: 'ok',
      text:
        kind === 'pay'
          ? `${amount} lançado ${where}. Salve o cliente para guardar.`
          : `${amount} retirado ${where}. Salve o cliente para guardar.`,
    })
    setValue('')
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    submit('pay')
  }

  return (
    <div className="flex flex-col gap-2">
      <div onKeyDown={onKeyDown} className="flex flex-col gap-3 md:flex-row md:items-end">
        <TextField
          label="VALOR RECEBIDO"
          value={value}
          mask="money"
          placeholder="R$ 0,00"
          heightClass="h-[46px]"
          className="md:w-[260px]"
          onChange={(next) => {
            setValue(next)
            setFeedback(null)
          }}
        />
        <div className="flex gap-2.5">
          <Button onClick={() => submit('pay')} className="h-[46px] flex-1 cursor-pointer px-4 md:flex-none">
            <Check className="size-4" strokeWidth={2} aria-hidden="true" />
            Confirmar pagamento
          </Button>
          <Button
            variant="outline"
            onClick={() => submit('withdraw')}
            className="h-[46px] flex-1 cursor-pointer px-4 md:flex-none"
          >
            <Undo2 className="size-4" strokeWidth={1.75} aria-hidden="true" />
            Retirar
          </Button>
        </div>
      </div>
      <p
        role="status"
        className={
          feedback?.tone === 'error' ? 'text-[13px] text-[var(--overdue)]' : 'text-[13px] text-[var(--muted)]'
        }
      >
        {feedback?.text}
      </p>
    </div>
  )
}

function installmentList(numbers: number[]) {
  const labels = numbers.map((number) => String(number).padStart(2, '0'))
  if (labels.length === 1) return `na parcela ${labels[0]}`
  return `nas parcelas ${labels.slice(0, -1).join(', ')} e ${labels.at(-1)}`
}
