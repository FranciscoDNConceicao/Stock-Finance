import { useEffect, useRef, useState } from 'react'

const DAY = 1440
const OPEN = 9 * 60 + 30 // 09:30 New York
const CLOSE = 16 * 60 // 16:00 New York
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export interface MarketStatus {
  isOpen: boolean
  /** Minutes until the next open (when closed) or the close (when open) */
  minutesLeft: number
  nyTime: string
}

/** NYSE regular session status. Ignores exchange holidays. */
function computeStatus(now: Date): MarketStatus {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const day = WEEKDAYS.indexOf(get('weekday'))
  const minute = day * DAY + Number(get('hour')) * 60 + Number(get('minute'))

  for (let d = 0; d < 5; d++) {
    const open = d * DAY + OPEN
    const close = d * DAY + CLOSE
    if (minute >= open && minute < close) {
      return { isOpen: true, minutesLeft: close - minute, nyTime: `${get('hour')}:${get('minute')}` }
    }
  }
  const nextOpen = [0, 1, 2, 3, 4].map((d) => d * DAY + OPEN).find((open) => open > minute) ?? 7 * DAY + OPEN
  return { isOpen: false, minutesLeft: nextOpen - minute, nyTime: `${get('hour')}:${get('minute')}` }
}

export function useMarketStatus(): MarketStatus {
  const [status, setStatus] = useState(() => computeStatus(new Date()))
  useEffect(() => {
    const id = window.setInterval(() => setStatus(computeStatus(new Date())), 15_000)
    return () => window.clearInterval(id)
  }, [])
  return status
}

export function formatDuration(minutes: number): string {
  const d = Math.floor(minutes / DAY)
  const h = Math.floor((minutes % DAY) / 60)
  const m = minutes % 60
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Animates a number from its previous value to `target` with an ease-out curve. */
export function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0)
  const from = useRef(0)

  useEffect(() => {
    if (!Number.isFinite(target)) return
    if (prefersReducedMotion()) {
      from.current = target
      setValue(target)
      return
    }
    const start = performance.now()
    const origin = from.current
    let frame = 0
    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      const v = origin + (target - origin) * eased
      from.current = v
      setValue(v)
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}
