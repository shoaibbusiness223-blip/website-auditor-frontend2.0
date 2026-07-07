import Link from 'next/link'

type Plan = 'free' | 'pro' | 'agency'

const BADGE_STYLES: Record<Plan, string> = {
  free:   'bg-slate-700 text-slate-300',
  pro:    'bg-brand-500/10 text-brand-400 border border-brand-500/20',
  agency: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
}

export function PlanBadge({ plan }: { plan: Plan }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE_STYLES[plan]}`}>
      {plan === 'pro' && '⚡'}
      {plan === 'agency' && '🏢'}
      {plan.charAt(0).toUpperCase() + plan.slice(1)}
    </span>
  )
}

export function AuditLimitBar({
  used,
  limit,
  plan,
}: {
  used: number
  limit: number
  plan: Plan
}) {
  const pct = Math.min((used / limit) * 100, 100)
  const isNearLimit = pct >= 80
  const isAtLimit = pct >= 100

  return (
    <div className="rounded-lg border border-white/5 bg-slate-900 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-slate-400">Audits this month</span>
        <span className={`text-xs font-medium ${isAtLimit ? 'text-red-400' : isNearLimit ? 'text-amber-400' : 'text-slate-300'}`}>
          {used} / {limit === 999 ? '∞' : limit}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-brand-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isAtLimit && plan === 'free' && (
        <div className="mt-3 flex items-center justify-between rounded-lg bg-brand-500/5 border border-brand-500/10 px-3 py-2">
          <p className="text-xs text-brand-300">Free plan limit reached</p>
          <Link href="/pricing" className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition">
            Upgrade →
          </Link>
        </div>
      )}
    </div>
  )
}

export function ActionPlanGate() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/5 bg-slate-900">
      <div className="pointer-events-none select-none blur-sm opacity-40 p-5">
        {['Day 1', 'Day 3', 'Week 1', 'Week 2'].map(day => (
          <div key={day} className="mb-3 flex items-start gap-4 border-b border-white/5 pb-3">
            <div className="flex h-8 w-14 shrink-0 items-center justify-center rounded-md bg-slate-800 text-xs font-mono text-slate-400">{day}</div>
            <div className="flex-1">
              <div className="mb-1.5 h-2.5 w-24 rounded bg-slate-700" />
              <div className="h-2 w-48 rounded bg-slate-800" />
            </div>
          </div>
        ))}
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 p-6 text-center backdrop-blur-[2px]">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/10">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        </div>
        <h3 className="mb-1 text-sm font-semibold text-white">Action plan is a Pro feature</h3>
        <p className="mb-4 max-w-xs text-xs text-slate-400">
          Upgrade to Pro to unlock your personalised 30-day action plan with step-by-step tasks.
        </p>
        <Link
          href="/pricing"
          className="rounded-lg bg-brand-500 px-5 py-2 text-xs font-semibold text-white transition hover:bg-brand-600 active:scale-95"
        >
          Upgrade to Pro — from $19/mo
        </Link>
      </div>
    </div>
  )
}

export function PdfExportButton({ plan, auditId }: { plan: Plan; auditId: string }) {
  if (plan === 'free') {
    return (
      <Link
        href="/pricing"
        className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-500 transition hover:border-white/20 hover:text-slate-300"
        title="Upgrade to Pro for PDF export"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
        PDF Export (Pro)
      </Link>
    )
  }

  return (
    <a
      href={`${process.env.NEXT_PUBLIC_API_URL}/api/audit/${auditId}/pdf`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:border-white/20 hover:text-white"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      Export PDF
    </a>
  )