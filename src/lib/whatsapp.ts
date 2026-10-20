import { formatSlashDate } from '@/lib/dates'
import { phoneDigits } from '@/lib/mask'
import { formatMoney } from '@/lib/money'

export function whatsappNumber(phone: string) {
  const digits = phoneDigits(phone)
  if (digits.length < 10) return null
  return `55${digits}`
}

export function overdueReminder({
  name,
  number,
  dueDate,
  missingCents,
}: {
  name: string
  number: string
  dueDate: string
  missingCents: number
}) {
  const firstName = name.trim().split(/\s+/)[0]
  const greeting = firstName ? `Oi, ${firstName}! Tudo bem?` : 'Oi! Tudo bem?'
  return [
    greeting,
    `Aqui é da Rabisco Ink. Passando só para lembrar que a parcela ${number} da sua tatuagem, com vencimento em ${formatSlashDate(dueDate)}, ainda está em aberto (${formatMoney(missingCents, 'precise')}).`,
    'Se já tiver feito o pagamento, pode desconsiderar esta mensagem. Qualquer dúvida ou se precisar combinar outra data, é só chamar a gente por aqui.',
    'Obrigado!\nEquipe Rabisco Ink',
  ].join('\n\n')
}

export function whatsappLink(phone: string, message: string) {
  const number = whatsappNumber(phone)
  if (!number) return null
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
