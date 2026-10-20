export type MaskKind = 'phone' | 'date'

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
  const value = kind === 'phone' ? maskPhone(input.value) : maskDate(input.value)
  input.value = value
  const caret = caretAfterDigits(value, digitsBefore)
  const place = () => {
    if (document.activeElement === input) input.setSelectionRange(caret, caret)
  }
  place()
  requestAnimationFrame(place)
  return value
}
