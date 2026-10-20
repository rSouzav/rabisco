import { Button } from '@/components/ui/Button'
import { SelectField } from '@/components/ui/SelectField'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { TextField } from '@/components/ui/TextField'
import { InstallmentEditor } from '@/components/ficha/InstallmentEditor'
import { useClientDraft } from '@/components/ficha/useClientDraft'
import { createId, draftToClient } from '@/lib/draft'
import { formatMoney } from '@/lib/money'
import { formatShortDate } from '@/lib/dates'
import { TATTOO_ARTISTS, type Client } from '@/types/client'
import { ChevronLeft, Trash2 } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

type ClientFileFormProps = {
  client: Client | null
  onSave: (client: Client) => Promise<string | null>
  onCancel: () => void
  onDelete: () => void
}

const PERSONAL_FIELDS = [
  { key: 'name', label: 'NOME', autoComplete: 'name' },
  { key: 'phone', label: 'TELEFONE', autoComplete: 'tel', mask: 'phone', placeholder: '(11) 98821-4402' },
  { key: 'email', label: 'E-MAIL', autoComplete: 'email', type: 'email', inputMode: 'email' },
  { key: 'instagram', label: 'INSTAGRAM', autoComplete: 'off' },
  { key: 'birthDate', label: 'NASCIMENTO', placeholder: 'dd/mm/aaaa', mask: 'date' },
] as const

export function ClientFileForm({ client, onSave, onCancel, onDelete }: ClientFileFormProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const draftState = useClientDraft(client)
  const { draft, view, saved, today } = draftState
  const meta = [draft.phone.trim(), draft.title.trim() || draft.bodyLocation.trim()].filter(Boolean)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    const message = await onSave(draftToClient(draft, client?.id || createId()))
    setBusy(false)
    if (!message) draftState.markSaved()
  }

  const saveLabel = busy ? 'Salvando…' : saved ? 'Salvo' : 'Salvar cliente'

  function onImage(file: File | undefined) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') draftState.setImage(reader.result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 py-4 md:gap-7 md:px-7 md:py-7 xl:px-9 xl:py-9">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <Link to="/clientes" className="hidden items-center gap-1.5 text-[13px] text-[var(--muted)] xl:inline-flex">
            <ChevronLeft className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
            Clientes
          </Link>
          <div className="flex flex-wrap items-center gap-3.5">
            <h1 className="font-display text-[28px] leading-none md:text-[36px]">
              {draft.name.trim() || 'Novo cliente'}
            </h1>
            {view.totalCents > 0 && <StatusBadge status={view.status} />}
          </div>
          {meta.length > 0 && (
            <p className="text-[14px] text-[var(--muted)]">
              <span className="block md:inline">{meta[0]}</span>
              {meta[1] && (
                <>
                  <span className="hidden md:inline"> · </span>
                  <span className="mt-1 block md:mt-0 md:inline">{meta[1]}</span>
                </>
              )}
            </p>
          )}
        </div>
        <div className="hidden shrink-0 items-center gap-2.5 md:flex">
          <Button variant="outline" className="h-11 px-4" onClick={onCancel}>
            Voltar
          </Button>
          <Button type="submit" disabled={busy} className="h-11 px-[18px]">
            {saveLabel}
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-8 md:flex-row md:items-start xl:gap-9">
        <section className="flex w-full flex-col gap-3.5 md:w-[360px] md:shrink-0 xl:w-[500px]">
          <h2 className="font-display text-[20px]">Dados pessoais</h2>
          {PERSONAL_FIELDS.map((field) => (
            <TextField
              key={field.key}
              label={field.label}
              value={draft[field.key]}
              autoComplete={'autoComplete' in field ? field.autoComplete : undefined}
              placeholder={'placeholder' in field ? field.placeholder : undefined}
              type={'type' in field ? field.type : 'text'}
              inputMode={'inputMode' in field ? field.inputMode : undefined}
              mask={'mask' in field ? field.mask : undefined}
              heightClass="h-[46px]"
              onChange={(value) => draftState.update(field.key, value)}
              onBlur={field.key === 'phone' ? draftState.blurPhone : undefined}
            />
          ))}
          <TextField
            label="OBSERVAÇÕES"
            value={draft.notes}
            multiline
            onChange={(value) => draftState.update('notes', value)}
          />
        </section>

        <section className="flex min-w-0 flex-1 flex-col gap-3.5">
          <h2 className="font-display text-[20px]">Tatuagem</h2>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="block w-full border border-[var(--line)] text-left"
          >
            {draft.imageUrl ? (
              <img
                src={draft.imageUrl}
                alt="Referência da tatuagem"
                className="h-[280px] w-full object-contain xl:h-[380px]"
              />
            ) : (
              <span className="flex h-[280px] w-full items-center justify-center bg-[var(--surface)] px-6 text-center text-[13px] text-[var(--muted)] xl:h-[380px]">
                Adicionar foto ou referência
              </span>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => onImage(event.target.files?.[0])}
          />
          <p className="text-[12px] text-[var(--muted)]">
            Foto ou referência enviada pela cliente. Dá para trocar a imagem.
          </p>
          <TextField
            label="DESCRIÇÃO"
            value={draft.description}
            multiline
            heightClass="h-[88px]"
            onChange={(value) => draftState.update('description', value)}
          />
          <TextField
            label="LOCAL DO CORPO"
            value={draft.bodyLocation}
            heightClass="h-[46px]"
            onChange={(value) => draftState.update('bodyLocation', value)}
          />
          <SelectField
            label="TATUADOR"
            value={draft.artist}
            options={TATTOO_ARTISTS}
            heightClass="h-[46px]"
            onChange={(value) => draftState.update('artist', value)}
          />
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <TextField
              label="VALOR TOTAL"
              value={draft.total}
              inputMode="decimal"
              heightClass="h-[46px]"
              onChange={(value) => draftState.update('total', value)}
              onBlur={() => draftState.blurSchedule('total')}
            />
            <TextField
              label="VEZES"
              value={draft.times}
              inputMode="numeric"
              heightClass="h-[46px]"
              onChange={(value) => draftState.update('times', value)}
              onBlur={() => draftState.blurSchedule('times')}
            />
            <TextField
              label="MENSALIDADE"
              value={draft.monthly}
              inputMode="decimal"
              heightClass="h-[46px]"
              onChange={(value) => draftState.update('monthly', value)}
              onBlur={() => draftState.blurSchedule('monthly')}
            />
            <TextField
              label="INÍCIO"
              value={draft.startDate}
              placeholder="dd/mm/aaaa"
              mask="date"
              heightClass="h-[46px]"
              onChange={(value) => draftState.update('startDate', value)}
              onBlur={() => draftState.blurSchedule('start')}
            />
          </div>
          <p className="hidden text-[12px] leading-[1.4] text-[var(--muted)] md:block">
            A mensalidade é o valor dividido pelas vezes. As parcelas abaixo nascem disso e podem ser ajustadas uma a
            uma.
          </p>
        </section>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-[20px]">Parcelas</h2>
        <p className="text-[12px] leading-[1.4] text-[var(--muted)] xl:hidden">
          Marque o que já foi pago e anote o valor e o dia.
        </p>
        <p className="hidden text-[12px] leading-[1.4] text-[var(--muted)] xl:block">
          Marque o que já foi pago. Se entrou um valor diferente, registre em valor pago e o dia. O que falta continua
          na próxima cobrança.
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 border-y border-[var(--line)] py-3 md:grid-cols-4 md:py-[18px]">
          <Total label="AINDA DEVE" value={formatMoney(view.balanceCents, 'precise')} />
          <Total label="EM ATRASO" value={formatMoney(view.overdueCents, 'precise')} tone="overdue" />
          <Total label="MENSALIDADE" value={formatMoney(view.monthlyCents, 'precise')} />
          <Total label="JÁ RECEBIDO" value={formatMoney(view.receivedCents, 'precise')} />
        </div>
        <InstallmentEditor
          items={draft.Installments}
          today={today}
          clientName={draft.name}
          phone={draft.phone}
          onToggle={draftState.togglePaid}
          onPaidChange={(number, value) => draftState.updateInstallment(number, { paidText: value })}
          onPaidBlur={draftState.blurPaid}
          onDateChange={(number, value) => draftState.updateInstallment(number, { paidOnText: value })}
        />
      </section>

      <footer className="hidden items-center justify-between gap-4 md:flex">
        <Button variant="danger" onClick={onDelete} disabled={busy} className="h-11 px-4">
          <Trash2 className="size-4" strokeWidth={1.75} aria-hidden="true" />
          Excluir cliente
        </Button>
        {view.nextOnTime && (
          <p className="text-[13px] text-[var(--muted)]">
            Próxima cobrança em dia: {formatShortDate(view.nextOnTime.dueDate)} ·{' '}
            {formatMoney(view.nextOnTime.expectedCents, 'precise')}
          </p>
        )}
      </footer>

      <div className="flex flex-col gap-2.5 md:hidden">
        <Button type="submit" disabled={busy} className="h-12 w-full">
          {saveLabel}
        </Button>
        <Button variant="danger" onClick={onDelete} disabled={busy} className="h-12 w-full">
          <Trash2 className="size-4" strokeWidth={1.75} aria-hidden="true" />
          Excluir cliente
        </Button>
      </div>
    </form>
  )
}

function Total({ label, value, tone = 'bone' }: { label: string; value: string; tone?: 'bone' | 'overdue' }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[11px] tracking-[1px] text-[var(--muted)]">{label}</p>
      <p
        className={
          tone === 'overdue'
            ? 'font-display text-[22px] leading-none text-[var(--overdue)] md:text-[26px]'
            : 'font-display text-[22px] leading-none md:text-[26px]'
        }
      >
        {value}
      </p>
    </div>
  )
}
