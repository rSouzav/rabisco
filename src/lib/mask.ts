import { formatMoney } from '@/lib/money'

export type MaskKind = 'phone' | 'date' | 'money'

const MONEY_MAX_DIGITS = 11

export function maskInputMode(kind: MaskKind | undefined) {
  if (kind === 'phone') return 'tel'
  if (kind === 'date' || kind === 'money') return 'numeric'
  return undefined
}

export function phoneDigits(value: string) {
  let digits = value.replace(/\D/g, '')
  if (digits.length > 11 && digits.startsWith('55')) digits = digits.slice(2)
  return digits.slice(0, 11)
}

export function maskPhone(value: string) {
  const digits = phoneDigits(value)
  if (!digits) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

const VALID_DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48,
  49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89,
  91, 92, 93, 94, 95, 96, 97, 98, 99,
])

export function phoneError(value: string) {
  const digits = phoneDigits(value)
  if (!digits) return 'Informe o telefone do cliente.'
  if (digits.length < 10) return 'Telefone incompleto. Use DDD + número, ex.: (11) 98821-4402.'
  if (!VALID_DDDS.has(Number(digits.slice(0, 2)))) return 'DDD inválido.'
  const number = digits.slice(2)
  if (/^(\d)\1+$/.test(number)) return 'Telefone inválido.'
  if (number.length === 9 && number[0] !== '9') return 'Celular deve começar com 9.'
  if (number.length === 8 && !/^[2-5]/.test(number)) return 'Telefone fixo inválido. Celular precisa ter 9 dígitos.'
  return null
}

export function maskPhoneFinal(value: string) {
  const digits = phoneDigits(value)
  if (digits.length !== 10) return maskPhone(value)
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
}

export function maskDate(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export function maskMoney(value: string) {
  const raw = value.replace(/\D/g, '')
  if (!raw) return ''
  const digits = raw.replace(/^0+/, '').slice(0, MONEY_MAX_DIGITS)
  return formatMoney(Number(digits || '0'), 'precise')
}

function caretBeforeTrailingDigits(masked: string, digitCount: number) {
  let seen = 0
  for (let index = masked.length; index > 0; index -= 1) {
    if (seen === digitCount) return index
    if (/\d/.test(masked[index - 1] ?? '')) seen += 1
  }
  return seen === digitCount ? 0 : masked.length
}

function caretAfterDigits(masked: string, digitCount: number) {
  if (digitCount <= 0) return 0
  let seen = 0
  for (let index = 0; index < masked.length; index += 1) {
    if (/\d/.test(masked[index] ?? '')) seen += 1
    if (seen === digitCount) return index + 1
  }
  return masked.length
}

export function commitMask(input: HTMLInputElement, kind: MaskKind) {
  const selectionStart = input.selectionStart ?? input.value.length
  const digitsBefore = input.value.slice(0, selectionStart).replace(/\D/g, '').length
  const digitsAfter = input.value.slice(selectionStart).replace(/\D/g, '').length
  const value = kind === 'phone' ? maskPhone(input.value) : kind === 'date' ? maskDate(input.value) : maskMoney(input.value)
  input.value = value
  const caret =
    kind === 'money' ? caretBeforeTrailingDigits(value, digitsAfter) : caretAfterDigits(value, digitsBefore)
  const place = () => {
    if (document.activeElement === input) input.setSelectionRange(caret, caret)
  }
  place()
  requestAnimationFrame(place)
  return value
}
