import { faCompass } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'

export default function NotFound() {
  return (
    <Card className="mx-auto max-w-lg">
      <EmptyState
        icon={faCompass}
        title="Page not found"
        description="The page you are looking for doesn't exist or has been moved."
        action={
          <Link
            to="/"
            className="inline-flex cursor-pointer items-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Back to dashboard
          </Link>
        }
      />
    </Card>
  )
}
