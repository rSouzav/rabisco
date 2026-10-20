export function formatMoney(cents: number, mode: 'compact' | 'precise' = 'compact') {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: mode === 'precise' ? 2 : 0,
    maximumFractionDigits: mode === 'precise' ? 2 : 0,
  })
}

export function parseMoney(input: string) {
  const cleaned = input.replace(/[^\d,.-]/g, '').trim()
  if (!cleaned || cleaned === '-' || cleaned === ',') return 0

  const sign = cleaned.startsWith('-') ? -1 : 1
  if (cleaned.includes(',')) {
    const [wholeRaw, fractionRaw = ''] = cleaned.split(',')
    const whole = wholeRaw.replace(/\./g, '').replace('-', '')
    const fraction = fractionRaw.replace(/\D/g, '').slice(0, 2).padEnd(2, '0')
    return sign * (Number(whole || '0') * 100 + Number(fraction || '0'))
  }

  const whole = cleaned.replace(/\./g, '').replace('-', '')
  if (!whole) return 0
  return sign * Number(whole) * 100
}
