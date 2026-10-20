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
