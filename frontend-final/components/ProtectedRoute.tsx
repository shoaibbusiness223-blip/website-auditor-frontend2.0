import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import Spinner from './Spinner'

/**
 * Wrap any page's content in <ProtectedRoute> to require authentication.
 * - While auth state is bootstrapping, shows a full-screen spinner.
 * - If not authenticated once loading completes, redirects to /login
 *   and preserves the original destination via ?next= for post-login redirect.
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const next = router.asPath
      router.replace(`/login?next=${encodeURIComponent(next)}`)
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Spinner size={28} />
      </div>
    )
  }

  return <>{children}</>
}
