import { apiRequest } from './apiClient'
import type { AuditRow, AuditListData } from '../types/api'

// ─────────────────────────────────────────────────────────────────────────────
// Maps 1:1 to backend src/routes/audit.routes.ts (all routes require auth):
//   POST /api/audit          → run a new audit, returns the completed AuditRow
//   GET  /api/audit          → list current user's audits (paginated)
//   GET  /api/audit/:id      → fetch a single audit by id
// ─────────────────────────────────────────────────────────────────────────────

export async function runAudit(url: string): Promise<AuditRow> {
  return apiRequest<AuditRow>('/api/audit', {
    method: 'POST',
    auth: true,
    body: { url },
  })
}

export async function listAudits(limit = 10, offset = 0): Promise<AuditListData> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
  return apiRequest<AuditListData>(`/api/audit?${params.toString()}`, {
    method: 'GET',
    auth: true,
  })
}

export async function getAudit(id: string): Promise<AuditRow> {
  return apiRequest<AuditRow>(`/api/audit/${encodeURIComponent(id)}`, {
    method: 'GET',
    auth: true,
  })
}
