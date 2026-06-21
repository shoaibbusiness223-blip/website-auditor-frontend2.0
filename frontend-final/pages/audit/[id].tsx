import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import ProtectedRoute from '../../components/ProtectedRoute'
import ScoreRing from '../../components/ScoreRing'
import Spinner from '../../components/Spinner'
import { getAudit } from '../../lib/auditService'
import { ApiClientError } from '../../lib/apiClient'
import type {
  AuditRow,
  AuditCategory,
  IssueSeverity,
  RecommendationPriority,
} from '../../types/api'

const CATEGORY_LABELS: Record<AuditCategory, string> = {
  seo: 'SEO',
  conversion: 'Conversion',
  trust: 'Trust',
  copywriting: 'Copywriting',
}

const CATEGORY_DOT: Record<AuditCategory, string> = {
  seo: 'bg-indigo-400',
  conversion: 'bg-emerald-400',
  trust: 'bg-orange-400',
  copywriting: 'bg-pink-400',
}

const SEVERITY_ORDER: Record<IssueSeverity, number> = { critical: 0, warning: 1, info: 2 }
const PRIORITY_ORDER: Record<RecommendationPriority, number> = { high: 0, medium: 1, low: 2 }

function SeverityBadge({ severity }: { severity: IssueSeverity }) {
  const styles: Record<IssueSeverity, string> = {
    critical: 'bg-red-500/10 text-red-400',
    warning: 'bg-amber-500/10 text-amber-400',
    info: 'bg-blue-500/10 text-blue-400',
  }
  return <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${styles[severity]}`}>{severity}</span>
}

function PriorityBadge({ priority }: { priority: RecommendationPriority }) {
  const styles: Record<RecommendationPriority, string> = {
    high: 'bg-red-500/10 text-red-400',
    medium: 'bg-amber-500/10 text-amber-400',
    low: 'bg-slate-700 text-slate-300',
  }
  return <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${styles[priority]}`}>{priority}</span>
}

function CategoryBadge({ category }: { category: AuditCategory }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300">
      <span className={`h-1.5 w-1.5 rounded-full ${CATEGORY_DOT[category]}`} />
      {CATEGORY_LABELS[category]}
    </span>
  )
}

type TabKey = 'overview' | 'issues' | 'recommendations' | 'action-plan'

function AuditReportContent() {
  const router = useRouter()
  const id = typeof router.query.id === 'string' ? router.query.id : undefined

  const [audit, setAudit] = useState<AuditRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  useEffect(() => {
    if (!id) return
    let cancelled = false

    setLoading(true)
    setError('')
    getAudit(id)
      .then((data) => {
        if (!cancelled) setAudit(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiClientError ? err.message : 'Failed to load audit report')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Spinner size={28} />
      </div>
    )
  }

  if (error || !audit) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center">
        <p className="mb-2 text-sm font-semibold text-white">Report not found</p>
        <p className="mb-6 max-w-xs text-sm text-slate-500">{error || 'This audit does not exist or you do not have access to it.'}</p>
        <Link href="/dashboard" className="text-sm text-brand-400 transition hover:text-brand-300">
          ← Back to dashboard
        </Link>
      </div>
    )
  }

  // Audit exists but hasn't finished processing yet (defensive — POST /api/audit
  // currently returns synchronously once completed, but this guards against
  // a future async/queued implementation).
  if (audit.status !== 'completed' || !audit.report_json) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center">
        {audit.status === 'failed' ? (
          <>
            <p className="mb-2 text-sm font-semibold text-white">Audit failed</p>
            <p className="mb-6 max-w-sm text-sm text-slate-500">{audit.error_message || 'Something went wrong while analyzing this website.'}</p>
          </>
        ) : (
          <>
            <Spinner size={28} className="mb-4" />
            <p className="mb-2 text-sm font-semibold text-white">Audit in progress</p>
            <p className="mb-6 max-w-sm text-sm text-slate-500">This page will update automatically once it's done.</p>
          </>
        )}
        <Link href="/dashboard" className="text-sm text-brand-400 transition hover:text-brand-300">
          ← Back to dashboard
        </Link>
      </div>
    )
  }

  const report = audit.report_json
  const scores = [
    { type: 'SEO' as const, value: audit.seo_score ?? 0 },
    { type: 'Conversion' as const, value: audit.conversion_score ?? 0 },
    { type: 'Trust' as const, value: audit.trust_score ?? 0 },
    { type: 'Copywriting' as const, value: audit.copywriting_score ?? 0 },
  ]

  const sortedIssues = [...report.issues].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
  const sortedRecs = [...report.recommendations].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'issues', label: `Issues (${sortedIssues.length})` },
    { key: 'recommendations', label: `Recommendations (${sortedRecs.length})` },
    { key: 'action-plan', label: 'Action plan' },
  ]

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="flex h-16 items-center justify-between border-b border-white/5 px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M8 5V11M5 6.5L8 5L11 6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-white">GrowthAuditor</span>
        </Link>
        <Link href="/dashboard" className="text-xs text-slate-400 transition hover:text-white">
          ← Back to dashboard
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="break-all text-lg font-semibold text-white">{audit.website_url}</h1>
          <p className="mt-1 text-xs text-slate-500">
            Audited {new Date(audit.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
          </p>
        </div>

        {/* Score cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <div className="col-span-2 flex flex-col items-center justify-center rounded-xl border border-white/5 bg-slate-900 p-5 lg:col-span-1">
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-slate-500">Overall</p>
            <ScoreRing score={audit.overall_score ?? 0} label="Overall" size={90} />
          </div>
          {scores.map((s) => (
            <div key={s.type} className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-slate-900 p-5">
              <ScoreRing score={s.value} label={s.type} size={72} />
            </div>
          ))}
        </div>

        {/* Summary */}
        {report.summary && (
          <div className="mb-6 rounded-xl border border-white/5 bg-slate-900 p-5">
            <p className="mb-1.5 text-xs font-medium text-slate-500">AI summary</p>
            <p className="text-sm leading-relaxed text-slate-300">{report.summary}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-white/5">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`-mb-px shrink-0 border-b-2 px-4 py-2.5 text-xs font-medium transition ${
                activeTab === tab.key
                  ? 'border-brand-500 text-brand-400'
                  : 'border-transparent text-slate-500 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-white/5 bg-slate-900 p-6">
              <h2 className="mb-4 text-sm font-semibold text-white">Score breakdown</h2>
              <div className="flex flex-col gap-4">
                {scores.map((s) => (
                  <div key={s.type} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-xs text-slate-500">{s.type}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full rounded-full ${CATEGORY_DOT[s.type.toLowerCase() as AuditCategory] || 'bg-brand-500'}`}
                        style={{ width: `${s.value}%` }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-xs font-medium text-slate-300">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/5 bg-slate-900 p-6">
              <h2 className="mb-4 text-sm font-semibold text-white">Top issues</h2>
              <div className="flex flex-col gap-3">
                {sortedIssues.slice(0, 4).map((issue, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg bg-slate-800/50 p-3">
                    <SeverityBadge severity={issue.severity} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-200">{issue.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">{issue.description}</p>
                    </div>
                  </div>
                ))}
                {sortedIssues.length > 4 && (
                  <button onClick={() => setActiveTab('issues')} className="text-left text-xs text-brand-400 transition hover:text-brand-300">
                    View all {sortedIssues.length} issues →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="flex flex-col gap-3">
            {sortedIssues.map((issue, i) => (
              <div key={i} className="rounded-xl border border-white/5 bg-slate-900 p-5">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={issue.severity} />
                  <CategoryBadge category={issue.category} />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-white">{issue.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{issue.description}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="flex flex-col gap-3">
            {sortedRecs.map((rec, i) => (
              <div key={i} className="rounded-xl border border-white/5 bg-slate-900 p-5">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <PriorityBadge priority={rec.priority} />
                  <CategoryBadge category={rec.category} />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-white">{rec.title}</h3>
                <p className="mb-3 text-sm leading-relaxed text-slate-400">{rec.detail}</p>
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/10 bg-emerald-500/5 px-3 py-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                  </svg>
                  <p className="text-xs text-emerald-400">{rec.estimatedImpact}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'action-plan' && (
          <div className="overflow-hidden rounded-xl border border-white/5 bg-slate-900">
            <div className="border-b border-white/5 px-5 py-4">
              <h2 className="text-sm font-semibold text-white">Your action plan</h2>
              <p className="mt-0.5 text-xs text-slate-500">Prioritised tasks to improve your scores step by step.</p>
            </div>
            <div className="divide-y divide-white/5">
              {report.action_plan.map((item, i) => (
                <div key={i} className="flex items-start gap-4 px-5 py-4">
                  <div className="flex h-8 w-14 shrink-0 items-center justify-center rounded-md bg-slate-800 text-xs font-mono font-medium text-slate-400">
                    {item.day}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1">
                      <CategoryBadge category={item.category} />
                    </div>
                    <p className="text-sm text-slate-200">{item.task}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function AuditReportPage() {
  return (
    <>
      <Head>
        <title>Audit Report — GrowthAuditor</title>
      </Head>
      <ProtectedRoute>
        <AuditReportContent />
      </ProtectedRoute>
    </>
  )
}
