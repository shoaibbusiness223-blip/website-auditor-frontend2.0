import Head from 'next/head'
import Link from 'next/link'
import { FormEvent, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import ProtectedRoute from '../components/ProtectedRoute'
import Spinner from '../components/Spinner'
import { useAuth } from '../contexts/AuthContext'
import { runAudit, listAudits } from '../lib/auditService'
import { ApiClientError } from '../lib/apiClient'
import type { AuditRow } from '../types/api'

function getHostname(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function scoreColorClass(score: number | null): string {
  if (score === null) return 'text-slate-600'
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-amber-400'
  return 'text-red-400'
}

function statusBadgeClass(status: AuditRow['status']): string {
  switch (status) {
    case 'completed': return 'bg-emerald-500/10 text-emerald-400'
    case 'failed': return 'bg-red-500/10 text-red-400'
    case 'processing': return 'bg-blue-500/10 text-blue-400'
    default: return 'bg-slate-700 text-slate-300'
  }
}

function DashboardContent() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [audits, setAudits] = useState<AuditRow[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState('')

  const loadAudits = useCallback(async () => {
    setListLoading(true)
    setListError('')
    try {
      const data = await listAudits(10, 0)
      setAudits(data.audits)
    } catch (err) {
      setListError(err instanceof ApiClientError ? err.message : 'Failed to load audits')
    } finally {
      setListLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAudits()
  }, [loadAudits])

  // Auto-fill the audit URL if the user arrived via the landing page hero
  // (?url=...) or post-signup redirect.
  useEffect(() => {
    const q = router.query.url
    if (typeof q === 'string' && q) {
      setUrl(q)
    }
  }, [router.query.url])

  function validateUrl(value: string): string {
    if (!value.trim()) return 'Enter a website URL'
    try {
      const parsed = new URL(value)
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return 'URL must start with http:// or https://'
      }
      return ''
    } catch {
      return 'Enter a valid URL, e.g. https://example.com'
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const err = validateUrl(url)
    setUrlError(err)
    if (err) return

    setSubmitting(true)
    setSubmitError('')
    try {
      const audit = await runAudit(url.trim())
      // Navigate straight to the completed report
      router.push(`/audit/${audit.id}`)
    } catch (err) {
      setSubmitError(err instanceof ApiClientError ? err.message : 'Audit failed. Please try again.')
      setSubmitting(false)
    }
  }

  const completed = audits.filter((a) => a.status === 'completed')
  const avgOverall = completed.length
    ? Math.round(completed.reduce((sum, a) => sum + (a.overall_score ?? 0), 0) / completed.length)
    : null

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top bar */}
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
        <div className="flex items-center gap-4">
          <span className="hidden text-xs text-slate-500 sm:inline">{user?.email}</span>
          <button
            onClick={logout}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="mb-1 text-xl font-semibold text-white">Dashboard</h1>
        <p className="mb-8 text-sm text-slate-400">Run a new audit or review your past reports.</p>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Total audits', value: audits.length },
            { label: 'Avg overall score', value: avgOverall !== null ? `${avgOverall}/100` : '—' },
            { label: 'Completed', value: completed.length },
            { label: 'Failed', value: audits.filter((a) => a.status === 'failed').length },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/5 bg-slate-900 p-4">
              <p className="mb-1 text-xs text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* New audit form */}
        <div className="mb-8 rounded-xl border border-white/5 bg-slate-900 p-6">
          <h2 className="mb-1 text-sm font-semibold text-white">Run a new audit</h2>
          <p className="mb-4 text-sm text-slate-400">Paste any URL to get your full growth report in under 30 seconds.</p>

          {submitError && (
            <div role="alert" className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex-1">
              <input
                type="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); if (urlError) setUrlError('') }}
                placeholder="https://yourwebsite.com"
                disabled={submitting}
                aria-invalid={!!urlError}
                className={`w-full rounded-lg border bg-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition disabled:opacity-60
                  ${urlError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'}`}
              />
              {urlError && <p className="mt-1.5 text-xs text-red-400">{urlError}</p>}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Spinner size={14} />}
              {submitting ? 'Auditing... (~30s)' : 'Run audit'}
            </button>
          </form>
        </div>

        {/* Audit list */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Recent audits</h2>
          <button
            onClick={loadAudits}
            className="text-xs text-slate-500 transition hover:text-white"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/5 bg-slate-900">
          {listLoading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size={24} />
            </div>
          ) : listError ? (
            <div className="px-5 py-12 text-center text-sm text-red-400">{listError}</div>
          ) : audits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="mb-1 text-sm font-semibold text-white">No audits yet</p>
              <p className="text-sm text-slate-500">Run your first audit above to see results here.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Website</th>
                  <th className="hidden px-5 py-3 text-left text-xs font-medium text-slate-500 sm:table-cell">Status</th>
                  <th className="hidden px-5 py-3 text-left text-xs font-medium text-slate-500 md:table-cell">Score</th>
                  <th className="hidden px-5 py-3 text-left text-xs font-medium text-slate-500 lg:table-cell">Date</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-slate-500">View</th>
                </tr>
              </thead>
              <tbody>
                {audits.map((audit, i) => (
                  <tr
                    key={audit.id}
                    className={`transition hover:bg-slate-800/40 ${i < audits.length - 1 ? 'border-b border-white/5' : ''}`}
                  >
                    <td className="px-5 py-4">
                      <p className="max-w-[200px] truncate text-sm font-medium text-white">{getHostname(audit.website_url)}</p>
                      <p className="max-w-[200px] truncate text-xs text-slate-500">{audit.website_url}</p>
                    </td>
                    <td className="hidden px-5 py-4 sm:table-cell">
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${statusBadgeClass(audit.status)}`}>
                        {audit.status}
                      </span>
                    </td>
                    <td className="hidden px-5 py-4 md:table-cell">
                      <span className={`text-sm font-semibold ${scoreColorClass(audit.overall_score)}`}>
                        {audit.overall_score !== null ? `${audit.overall_score}/100` : '—'}
                      </span>
                    </td>
                    <td className="hidden px-5 py-4 lg:table-cell">
                      <span className="text-xs text-slate-500">{timeAgo(audit.created_at)}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {audit.status === 'completed' ? (
                        <Link href={`/audit/${audit.id}`} className="text-xs font-medium text-brand-400 transition hover:text-brand-300">
                          View report →
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <>
      <Head>
        <title>Dashboard — GrowthAuditor</title>
      </Head>
      <ProtectedRoute>
        <DashboardContent />
      </ProtectedRoute>
    </>
  )
}
