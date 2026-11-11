import { ReactNode } from 'react'
import { cn } from '../../scripts/utils'

interface CardProps {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'article' | 'aside'
}

export function Card({ children, className, as: Tag = 'section' }: CardProps) {
  return (
    <Tag className={cn('rounded-2xl border border-line bg-surface shadow-card', className)}>
      {children}
    </Tag>
  )
}

interface CardHeaderProps {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}

export function CardHeader({ title, description, action, className }: CardHeaderProps) {
  return (
    <header className={cn('flex flex-wrap items-start justify-between gap-3 px-5 pt-5', className)}>
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold tracking-tight text-fg">{title}</h2>
        {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </header>
  )
}
