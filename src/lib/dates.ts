const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'] as const

export function todayISO(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function shiftISO(iso: string, days: number) {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(year, (month ?? 1) - 1, day)
  date.setDate(date.getDate() + days)
  return todayISO(date)
}

export function addMonths(iso: string, months: number) {
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return iso
  const target = new Date(year, month - 1 + months, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  target.setDate(Math.min(day, lastDay))
  return todayISO(target)
}

export function formatSlashDate(iso: string) {
  const [year, month, day] = iso.split('-')
  if (!year || !month || !day) return ''
  return `${day}/${month}/${year}`
}

export function parseSlashDate(value: string) {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return null
  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }
  return `${match[3]}-${match[2]}-${match[1]}`
}

export function formatDayMonth(iso: string) {
  const [, month, day] = iso.split('-')
  const monthIndex = Number(month) - 1
  const label = MONTHS[monthIndex] ?? ''
  return `${String(Number(day)).padStart(2, '0')} ${label}`
}

export function formatShortDate(iso: string) {
  const [year] = iso.split('-')
  return `${formatDayMonth(iso)} ${year}`
}
