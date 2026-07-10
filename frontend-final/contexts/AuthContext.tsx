import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react'
import { useRouter } from 'next/router'
import { fetchCurrentUser, login as loginRequest, signup as signupRequest } from '../lib/authService'
import { getAccessToken, setTokens, clearTokens } from '../lib/tokenStorage'
import { ApiClientError } from '../lib/apiClient'
import type { AuthUser } from '../types/api'

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, fullName: string) => Promise<{ user: { id: string; email: string }; session: unknown }>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  // Starts true: on first mount we don't yet know if a stored token is valid.
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // ── Bootstrap: if a token exists in storage, validate it against /me ──────
  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const token = getAccessToken()
      if (!token) {
        setIsLoading(false)
        return
      }
      try {
        const me = await fetchCurrentUser()
        if (!cancelled) setUser(me)
      } catch {
        // Token invalid/expired — apiClient already cleared it on 401.
        // For non-401 failures (network), clear defensively so we don't
        // get stuck in a perpetual "loading" loop on a dead token.
        clearTokens()
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginRequest(email, password)
    setTokens(result.session.access_token, result.session.refresh_token)
    setUser(result.user)
  }, [])
  const signup = useCallback(async (email: string, password: string, fullName: string) => {
    const result = await signupRequest(email, password, fullName)
    // Don't set user/tokens yet — wait until OTP verification completes.
    // Just return the result so the signup page can redirect to /auth/verify-otp.
    return result
  }, [])

  const logout = useCallback(() => {
    clearTokens()
    setUser(null)
    router.push('/login')
  }, [router])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
    }),
    [user, isLoading, login, signup, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

// Re-export for convenience in error handling around forms
export { ApiClientError }
