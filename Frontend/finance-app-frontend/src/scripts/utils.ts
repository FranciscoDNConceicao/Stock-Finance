export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

const numberFormatters = new Map<number, Intl.NumberFormat>()
export function formatNumber(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return '—'
  let fmt = numberFormatters.get(digits)
  if (!fmt) {
    fmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
    numberFormatters.set(digits, fmt)
  }
  return fmt.format(value)
}

export function formatSigned(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return '—'
  return `${value > 0 ? '+' : value < 0 ? '−' : ''}${formatNumber(Math.abs(value), digits)}`
}

/** Formats a ratio (0.0123) as a signed percentage (+1.23%). */
export function formatPercent(ratio: number, digits = 2): string {
  if (!Number.isFinite(ratio)) return '—'
  return `${formatSigned(ratio * 100, digits)}%`
}

export function formatCurrency(value: number, currency = 'EUR'): string {
  if (!Number.isFinite(value)) return '—'
  try {
    return new Intl.NumberFormat('en-IE', { style: 'currency', currency: currency.toUpperCase() }).format(value)
  } catch {
    return `${formatNumber(value)} ${currency.toUpperCase()}`
  }
}

export function formatCompact(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

export function formatDate(input: string | Date | null | undefined, withTime = false): string {
  if (!input) return ''
  const date = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(date.getTime())) return String(input)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

export function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value.replace(/,/g, '').trim())
  return NaN
}

/** Backend stores colors without '#'. Returns a safe hex color. */
export function hexColor(color: string | null | undefined, fallback = '#5B6CFF'): string {
  if (!color) return fallback
  const hex = color.startsWith('#') ? color : `#${color}`
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex) ? hex : fallback
}

/** Picks black or white text for the best contrast on a given background. */
export function readableOn(color: string): string {
  let hex = hexColor(color).slice(1)
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('')
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  // 0.179 is where black and white text reach equal WCAG contrast
  return luminance > 0.179 ? '#0B0E14' : '#FFFFFF'
}

export function safeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

export function prettyHost(url: string | null | undefined): string {
  if (!url) return ''
  try {
    return new URL(safeUrl(url)!).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
