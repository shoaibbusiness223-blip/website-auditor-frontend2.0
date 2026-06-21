// ─────────────────────────────────────────────────────────────────────────────
// Token persistence. Centralised so there is exactly one place that touches
// localStorage — every other module goes through these functions.
// ─────────────────────────────────────────────────────────────────────────────

const TOKEN_KEY = 'growthauditor_access_token'
const REFRESH_KEY = 'growthauditor_refresh_token'

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(REFRESH_KEY)
  } catch {
    return null
  }
}

export function setTokens(accessToken: string, refreshToken?: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(TOKEN_KEY, accessToken)
    if (refreshToken) {
      window.localStorage.setItem(REFRESH_KEY, refreshToken)
    }
  } catch {
    // localStorage unavailable (private browsing, etc.) — fail silently,
    // user will simply need to log in again each session.
  }
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(TOKEN_KEY)
    window.localStorage.removeItem(REFRESH_KEY)
  } catch {
    // ignore
  }
}

export function hasToken(): boolean {
  return !!getAccessToken()
}
