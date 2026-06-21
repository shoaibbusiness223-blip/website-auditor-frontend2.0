import { apiRequest } from './apiClient'
import type { AuthSuccessData, AuthUser } from '../types/api'

// ─────────────────────────────────────────────────────────────────────────────
// Maps 1:1 to backend src/routes/auth.routes.ts:
//   POST /api/auth/signup   (public)
//   POST /api/auth/login    (public)
//   GET  /api/auth/me       (protected)
// ─────────────────────────────────────────────────────────────────────────────

export async function signup(email: string, password: string, fullName: string): Promise<AuthSuccessData> {
  return apiRequest<AuthSuccessData>('/api/auth/signup', {
    method: 'POST',
    auth: false,
    body: { email, password, full_name: fullName },
  })
}

export async function login(email: string, password: string): Promise<AuthSuccessData> {
  return apiRequest<AuthSuccessData>('/api/auth/login', {
    method: 'POST',
    auth: false,
    body: { email, password },
  })
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  return apiRequest<AuthUser>('/api/auth/me', { method: 'GET', auth: true })
}
