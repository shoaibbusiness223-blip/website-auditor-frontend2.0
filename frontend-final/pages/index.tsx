import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import Navbar from '../components/Navbar'
import ScoreCard from '../components/ScoreCard'
import Footer from '../components/Footer'

// ── Icons ────────────────────────────────────────────────────────────────────

function IconSEO() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      <path d="M11 8v6M8 11h6"/>
    </svg>
  )
}
function IconConversion() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
    </svg>
  )
}
function IconTrust() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>
  )
}
function IconCopy() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  )
}
function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}
function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────

const SCORES = [
  {
    label: 'SEO Score',
    score: 78,
    color: '#818cf8',
    bgColor: 'bg-indigo-500/10',
    description: 'Title tags, meta descriptions, heading structure, alt text, SSL and internal linking quality.',
    icon: <IconSEO />,
  },
  {
    label: 'Conversion Score',
    score: 64,
    color: '#34d399',
    bgColor: 'bg-emerald-500/10',
    description: 'CTA quality and placement, value proposition clarity, page structure, and persuasion flow.',
    icon: <IconConversion />,
  },
  {
    label: 'Trust Score',
    score: 81,
    color: '#fb923c',
    bgColor: 'bg-orange-500/10',
    description: 'HTTPS, content depth, professional tone, credibility signals and social proof indicators.',
    icon: <IconTrust />,
  },
  {
    label: 'Copywriting Score',
    score: 70,
    color: '#f472b6',
    bgColor: 'bg-pink-500/10',
    description: 'Headline impact, meta copy quality, CTA text effectiveness and H2 clarity.',
    icon: <IconCopy />,
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Enter your URL',
    description: 'Paste any website URL. We fetch the live page in real time — no browser extension needed.',
  },
  {
    number: '02',
    title: 'We analyse everything',
    description: 'Our AI reads your page structure, copy, CTAs, images, and technical signals in under 30 seconds.',
  },
  {
    number: '03',
    title: 'Get your full report',
    description: 'Receive four scored dimensions, ranked issues, actionable recommendations, and a 30-day action plan.',
  },
]

const PLANS = [
  {
    name: 'Free',
    price: '0',
    description: 'Try it out, no card needed.',
    features: ['3 audits per month', 'All 4 score dimensions', 'Basic recommendations', 'PDF export'],
    cta: 'Start for free',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '19',
    description: 'For founders and marketers serious about growth.',
    features: ['50 audits per month', 'Full AI recommendations', '30-day action plan', 'Historical tracking', 'Priority support'],
    cta: 'Start Pro trial',
    href: '/signup?plan=pro',
    highlighted: true,
  },
  {
    name: 'Agency',
    price: '79',
    description: 'Audit client sites at scale.',
    features: ['Unlimited audits', 'White-label reports', 'Bulk URL upload', 'Team seats (5)', 'API access'],
    cta: 'Contact us',
    href: 'mailto:hello@growthanditor.com',
    highlighted: false,
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [url, setUrl] = useState('')

  function handleTryIt(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    window.location.href = `/signup?url=${encodeURIComponent(url)}`
  }

  return (
    <>
      <Head>
        <title>GrowthAuditor — AI Website Audit in 30 Seconds</title>
        <meta name="description" content="Enter any URL and get an instant AI-powered audit report covering SEO, conversion, trust and copywriting scores with a personalised action plan." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-32 pb-24">
          {/* Background grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
          {/* Glow */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />

          <div className="relative mx-auto max-w-4xl px-6 text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
              Powered by Google Gemini AI — Free to start
            </div>

            <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl">
              Know exactly why your website{' '}
              <span className="text-gradient-brand">isn&apos;t converting</span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-400">
              Paste any URL and get a full AI audit in 30 seconds — SEO score, conversion score,
              trust score, copywriting score, and a prioritised action plan to fix what matters most.
            </p>

            {/* URL input */}
            <form onSubmit={handleTryIt} className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row">
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="flex-1 rounded-lg border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 active:scale-95"
              >
                Audit my site
                <IconArrow />
              </button>
            </form>

            <p className="mt-4 text-xs text-slate-600">No credit card required · Results in under 30 seconds</p>
          </div>
        </section>

        {/* ── Mock Report Preview ────────────────────────────────────────── */}
        <section className="pb-24">
          <div className="mx-auto max-w-4xl px-6">
            <div className="card-border glow-brand overflow-hidden rounded-2xl bg-slate-900">
              {/* Report header bar */}
              <div className="flex items-center justify-between border-b border-white/5 bg-slate-900/80 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-slate-700" />
                    <span className="h-3 w-3 rounded-full bg-slate-700" />
                    <span className="h-3 w-3 rounded-full bg-slate-700" />
                  </div>
                  <span className="font-mono text-xs text-slate-500">audit-report — stripe.com</span>
                </div>
                <span className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                  ✓ Completed
                </span>
              </div>

              {/* Overall score */}
              <div className="border-b border-white/5 px-6 py-6">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-widest text-slate-500">Overall Score</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-white">73</span>
                      <span className="text-lg text-slate-500">/100</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">Good foundation — 6 high-priority issues to fix</p>
                  </div>
                  {/* Score bars */}
                  <div className="w-full sm:w-72 space-y-3">
                    {[
                      { label: 'SEO', score: 78, color: 'bg-indigo-400' },
                      { label: 'Conversion', score: 64, color: 'bg-emerald-400' },
                      { label: 'Trust', score: 81, color: 'bg-orange-400' },
                      { label: 'Copywriting', score: 70, color: 'bg-pink-400' },
                    ].map(s => (
                      <div key={s.label} className="flex items-center gap-3">
                        <span className="w-24 text-xs text-slate-500">{s.label}</span>
                        <div className="flex-1 overflow-hidden rounded-full bg-slate-800 h-1.5">
                          <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.score}%` }} />
                        </div>
                        <span className="w-8 text-right text-xs font-medium text-slate-300">{s.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sample issues */}
              <div className="px-6 py-5">
                <p className="mb-4 text-xs font-medium uppercase tracking-widest text-slate-500">Top Issues Found</p>
                <div className="space-y-3">
                  {[
                    { severity: 'critical', label: 'critical', color: 'text-red-400 bg-red-500/10', text: 'H1 tag missing on homepage — search engines cannot determine primary topic' },
                    { severity: 'warning', label: 'warning', color: 'text-amber-400 bg-amber-500/10', text: 'Meta description exceeds 160 characters — will be truncated in search results' },
                    { severity: 'info', label: 'info', color: 'text-blue-400 bg-blue-500/10', text: '3 CTA buttons use generic "Click here" text — replace with action-specific copy' },
                  ].map((issue, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg bg-slate-800/50 p-3">
                      <span className={`mt-0.5 rounded px-1.5 py-0.5 text-xs font-medium ${issue.color}`}>{issue.label}</span>
                      <p className="text-sm text-slate-300">{issue.text}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-center text-xs text-slate-600">+ 14 more recommendations and a 30-day action plan in your full report</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-24 border-t border-white/5">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-16 text-center">
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-brand-500">How it works</p>
              <h2 className="text-3xl font-bold text-white md:text-4xl">Audit in three steps</h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <div key={i} className="relative">
                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div className="absolute top-6 left-full hidden h-px w-full -translate-y-1/2 bg-gradient-to-r from-slate-700 to-transparent md:block" style={{ width: 'calc(100% - 2rem)', left: 'calc(100% - 1rem)' }} />
                  )}
                  <div className="card-border rounded-xl bg-slate-900/60 p-6">
                    <span className="mb-4 block font-mono text-xs font-bold text-brand-500">{step.number}</span>
                    <h3 className="mb-2 text-base font-semibold text-white">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-400">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Score dimensions ──────────────────────────────────────────── */}
        <section id="scores" className="py-24 border-t border-white/5">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-16 text-center">
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-brand-500">What we audit</p>
              <h2 className="text-3xl font-bold text-white md:text-4xl">Four scores that matter</h2>
              <p className="mx-auto mt-4 max-w-xl text-slate-400">Every dimension is scored 0–100 and comes with specific, ranked fixes — not generic advice.</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {SCORES.map(s => (
                <ScoreCard key={s.label} {...s} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Social proof numbers ───────────────────────────────────────── */}
        <section className="border-t border-white/5 py-20">
          <div className="mx-auto max-w-4xl px-6">
            <div className="grid gap-10 text-center sm:grid-cols-3">
              {[
                { number: '2,400+', label: 'Websites audited' },
                { number: '30s', label: 'Average audit time' },
                { number: '4.8★', label: 'Average user rating' },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-4xl font-bold text-white">{stat.number}</p>
                  <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ───────────────────────────────────────────────────── */}
        <section id="pricing" className="border-t border-white/5 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-16 text-center">
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-brand-500">Pricing</p>
              <h2 className="text-3xl font-bold text-white md:text-4xl">Simple, transparent pricing</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-xl p-6 ${
                    plan.highlighted
                      ? 'border-2 border-brand-500 bg-brand-500/5'
                      : 'card-border bg-slate-900/60'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
                      Most popular
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="mb-1 text-sm font-semibold text-slate-300">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">${plan.price}</span>
                      <span className="text-sm text-slate-500">/month</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{plan.description}</p>
                  </div>

                  <ul className="mb-8 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                        <IconCheck />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.href}
                    className={`block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition active:scale-95 ${
                      plan.highlighted
                        ? 'bg-brand-500 text-white hover:bg-brand-600'
                        : 'border border-white/10 text-slate-300 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────────────── */}
        <section className="border-t border-white/5 py-24">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Ready to grow your website?
            </h2>
            <p className="mb-8 text-slate-400">
              Your first 3 audits are completely free. No credit card, no setup — just paste your URL.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-600 active:scale-95"
            >
              Audit my website for free
              <IconArrow />
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}
