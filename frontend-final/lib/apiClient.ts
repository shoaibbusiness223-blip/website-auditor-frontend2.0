import { getAccessToken, clearTokens } from './tokenStorage'
import type { ApiResponse } from '../types/api'

// ─────────────────────────────────────────────────────────────────────────────
// Base URL comes from NEXT_PUBLIC_API_URL, set in .env.local / Vercel env vars.
// This must point at the deployed backend, e.g. https://api.yourapp.com
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_BASE_URL && typeof window !== 'undefined') {
  // Surface a loud, obvious error in the browser console rather than failing
  // silently with confusing "Failed to fetch" messages everywhere.
  // eslint-disable-next-line no-console
  console.error(
    '[GrowthAuditor] NEXT_PUBLIC_API_URL is not set. Add it to .env.local (dev) ' +
    'or your Vercel project environment variables (production).'
  )
}

export class ApiClientError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.code = code
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  auth?: boolean // attach Authorization header — default true
}

/**
 * Core request function. Every API call in the app goes through this.
 * - Attaches Bearer token automatically when auth !== false
 * - Parses the backend's { success, data } / { success, error, code } envelope
 * - On 401, clears the stored token (it's invalid/expired) so the UI can
 *   redirect to /login on next render
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options

  if (!API_BASE_URL) {
    throw new ApiClientError(
      'API URL is not configured. Set NEXT_PUBLIC_API_URL in your environment.',
      0,
      'CONFIG_ERROR'
    )
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (auth) {
    const token = getAccessToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    // Network failure — backend unreachable, CORS blocked, offline, etc.
    throw new ApiClientError(
      'Could not reach the server. Check your connection and try again.',
      0,
      'NETWORK_ERROR'
    )
  }

  let json: ApiResponse<T> | null = null
  try {
    json = await res.json()
  } catch {
    // Non-JSON response (e.g. a proxy error page)
    throw new ApiClientError(`Server returned an unexpected response (${res.status})`, res.status)
  }

  if (!json || json.success !== true) {
    const message = json && 'error' in json ? json.error : `Request failed (${res.status})`
    const code = json && 'code' in json ? json.code : undefined

    // Invalid/expired session — purge local token so AuthContext can react
    if (res.status === 401) {
      clearTokens()
    }

    throw new ApiClientError(message || 'Something went wrong', res.status, code)
  }

  return json.data
}
