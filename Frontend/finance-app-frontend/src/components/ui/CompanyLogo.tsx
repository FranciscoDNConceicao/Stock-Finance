import { useEffect, useState } from 'react'
import { cn, hexColor, readableOn } from '../../scripts/utils'

const sizes = {
  xs: 'h-6 w-6 rounded-md text-[9px] p-0.5',
  sm: 'h-9 w-9 rounded-lg text-[11px] p-1',
  md: 'h-11 w-11 rounded-xl text-xs p-1.5',
  lg: 'h-16 w-16 rounded-2xl text-base p-2',
  xl: 'h-20 w-20 rounded-2xl text-lg p-2.5',
}

interface CompanyLogoProps {
  code: string
  color?: string | null
  size?: keyof typeof sizes
  className?: string
}

/** Company logo on a light tile (most logos are dark-on-transparent), with a monogram fallback. */
export default function CompanyLogo({ code, color, size = 'md', className }: CompanyLogoProps) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [code])

  if (!code || failed) {
    const bg = hexColor(color)
    return (
      <div
        aria-hidden="true"
        className={cn('flex shrink-0 items-center justify-center font-semibold tracking-tight', sizes[size], className)}
        style={{ backgroundColor: bg, color: readableOn(bg) }}
      >
        {(code || '?').slice(0, 4)}
      </div>
    )
  }

  return (
    <div className={cn('flex shrink-0 items-center justify-center overflow-hidden bg-white ring-1 ring-black/5', sizes[size], className)}>
      <img
        src={`/images/logos/${code}.png`}
        alt=""
        loading="lazy"
        className="max-h-full max-w-full object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  )
}
