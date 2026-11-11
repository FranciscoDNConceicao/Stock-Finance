import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { Link, useLocation } from 'react-router-dom'
import { Card } from '../ui/Card'
import EmptyState from '../ui/EmptyState'
import { primaryButton, signInHref } from './links'

/** Shown instead of a page that needs an account. */
export default function SignInPrompt({ icon, title, description }: { icon: IconDefinition; title: string; description: string }) {
  const location = useLocation()
  return (
    <Card className="mx-auto max-w-lg">
      <EmptyState
        icon={icon}
        title={title}
        description={description}
        action={
          <Link to={signInHref(location.pathname + location.search)} className={primaryButton}>
            Sign in or create an account
          </Link>
        }
      />
    </Card>
  )
}
