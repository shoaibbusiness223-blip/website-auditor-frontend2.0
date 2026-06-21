// ─────────────────────────────────────────────────────────────────────────────
// Types mirrored exactly from backend: src/types/index.ts
// Keep in sync with backend whenever the API contract changes.
// ─────────────────────────────────────────────────────────────────────────────

// ── Generic API envelope (utils/response.ts: sendSuccess / sendError) ────────

export interface ApiSuccess<T> {
  success: true
  data: T
  message?: string
}

export interface ApiError {
  success: false
  error: string
  code?: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string
  created_at: string
}

export interface Session {
  access_token: string
  refresh_token: string
  expires_at?: number
  expires_in?: number
  token_type?: string
}

// Response shape of POST /api/auth/signup and POST /api/auth/login
export interface AuthSuccessData {
  user: AuthUser
  session: Session
}

// ── Audit report content (AI-generated JSON, stored in report_json) ──────────

export type AuditCategory = 'seo' | 'conversion' | 'trust' | 'copywriting'
export type IssueSeverity = 'critical' | 'warning' | 'info'
export type RecommendationPriority = 'high' | 'medium' | 'low'

export interface AuditIssue {
  severity: IssueSeverity
  category: AuditCategory
  title: string
  description: string
}

export interface Recommendation {
  priority: RecommendationPriority
  category: AuditCategory
  title: string
  detail: string
  estimatedImpact: string
}

export interface ActionPlanItem {
  day: string
  task: string
  category: AuditCategory
}

export interface AuditReport {
  seo_score: number
  conversion_score: number
  trust_score: number
  copywriting_score: number
  overall_score: number
  issues: AuditIssue[]
  recommendations: Recommendation[]
  action_plan: ActionPlanItem[]
  summary: string
}

// ── Scraped page data (stored in scraped_data) ────────────────────────────────

export interface ImageMeta {
  src: string
  alt: string
  hasMissingAlt: boolean
}

export interface ScrapedContent {
  url: string
  title: string
  metaDescription: string
  h1Tags: string[]
  h2Tags: string[]
  ctaButtons: string[]
  internalLinks: string[]
  images: ImageMeta[]
  wordCount: number
  hasSSL: boolean
  loadStatus: number
}

// ── Audit DB row — what GET /api/audit/:id and POST /api/audit return ────────

export type AuditStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface AuditRow {
  id: string
  user_id: string
  website_url: string
  status: AuditStatus
  seo_score: number | null
  conversion_score: number | null
  trust_score: number | null
  copywriting_score: number | null
  overall_score: number | null
  report_json: AuditReport | null
  scraped_data: ScrapedContent | null
  error_message?: string
  created_at: string
  updated_at: string
}

// GET /api/audit list response shape: { audits, limit, offset }
export interface AuditListData {
  audits: AuditRow[]
  limit: number
  offset: number
}
