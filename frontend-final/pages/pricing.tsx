import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

const API_URL = process.env.NEXT_PUBLIC_API_URL

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open(): void }
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  order_id: string
  name: string
  description: string
  handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void
  prefill: { email: string }
  theme: { color: string }
}

type Provider = 'razorpay' | 'paypal'
type Plan = 'pro' | 'agency'

const PLANS = [
  {
    key: 'free' as const,
    name: 'Free',
    priceUsd: '$0',
    priceInr: '₹0',
    period: '/month',
    description: 'Try it out',
    features: [
      { text: '3 audits per month', included: true },
      { text: 'All 4 score dimensions', included: true },
      { text: 'Issues & recommendations', included: true },
      { text: 'Action plan', included: false },
      { text: 'Full audit history', included: false },
      { text: 'PDF export', included: false },
      { text: 'API access', included: false },
    ],
    cta: 'Current plan',
    highlight: false,
  },
  {
    key: 'pro' as const,
    name: 'Pro',
    priceUsd: '$19',
    priceInr: '₹1,499',
    period: '/month',
    description: 'For founders & marketers',
    features: [
      { text: '50 audits per month', included: true },
      { text: 'All 4 score dimensions', included: true },
      { text: 'Issues & recommendations', included: true },
      { text: 'Action plan', included: true },
      { text: 'Full audit history', included: true },
      { text: 'PDF export', included: true },
      { text: 'API access', included: false },
    ],
    cta: 'Upgrade to Pro',
    highlight: true,
  },
  {
    key: 'agency' as const,
    name: 'Agency',
    priceUsd: '$79',
    priceInr: '₹6,499',
    period: '/month',
    description: 'Audit clients at scale',
    features: [
      { text: 'Unlimited audits', included: true },
      { text: 'All 4 score dimensions', included: true },
      { text: 'Issues & recommendations', included: true },
      { text: 'Action plan', included: true },
      { text: 'Full audit history', included: true },
      { text: 'PDF export', included: true },
      { text: 'API access', included: true },
    ],
    cta: 'Upgrade to Agency',
    highlight: false,
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [provider, setProvider] = useState<Provider>('paypal')
  const [loading, setLoading] = useState<Plan | null>(null)
  const [error, setError] = useState('')
  const [currentPlan, setCurrentPlan] = useState('free')
  const isIndia = provider === 'razorpay'

  useEffect(() => {
    fetch(`${API_URL}/api/payment/detect`, { method: 'POST' })
      .then(r => r.json())
      .then(d => { if (d.success) setProvider(d.data.provider) })
      .catch(() => {})

    const token = localStorage.getItem('growthauditor_access_token')
    if (token) {
      fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(d => { if (d.success) setCurrentPlan(d.data.plan || 'free') })
        .catch(() => {})
    }
  }, [])

  async function handleUpgrade(plan: Plan) {
    const token = localStorage.getItem('growthauditor_access_token')
    if (!token) {
      router.push('/login?next=/pricing')
      return
    }

    setLoading(plan)
    setError('')

    try {
      const res = await fetch(`${API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan, provider }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      if (provider === 'razorpay') {
        if (!window.Razorpay) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = () => resolve()
            script.onerror = reject
            document.body.appendChild(script)
          })
        }

        const userEmail = JSON.parse(atob(token.split('.')[1]))?.email || ''

        const rzp = new window.Razorpay({
          key: data.data.keyId,
          amount: data.data.amount,
          currency: data.data.currency,
          order_id: data.data.orderId,
          name: 'GrowthAuditor',
          description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
          handler: async (response) => {
            const verifyRes = await fetch(`${API_URL}/api/payment/verify-razorpay`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ ...response, plan }),
            })
            const verifyData = await verifyRes.json()
            if (verifyData.success) {
              router.push('/dashboard?upgraded=true')
            } else {
              setError('Payment verification failed. Contact support.')
            }
          },
          prefill: { email: userEmail },
          theme: { color: '#4f46e5' },
        })
        rzp.open()
        setLoading(null)

      } else {
        window.location.href = data.data.approvalUrl
      }
    } catch (err) {
      setError((err as Error).message || 'Payment failed. Please try again.')
      setLoading(null)
    }
  }

  return (
    <>
      <Head>
        <title>Pricing — GrowthAuditor</title>
        <meta name="description" content="Choose your GrowthAuditor plan. Start free, upgrade when ready." />
      </Head>

      <div className="min-h-screen bg-slate-950 px-4 py-16">
        <div className="mx-auto mb-12 flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">GrowthAuditor</span>
          </Link>
          <Link href="/dashboard" className="text-sm text-slate-400 transition hover:text-white">
            ← Dashboard
          </Link>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-brand-500">Pricing</p>
            <h1 className="mb-3 text-4xl font-bold text-white">Simple, honest pricing</h1>
            <p className="text-slate-400">Start free. Upgrade when you need more.</p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900 px-4 py-1.5 text-xs text-slate-400">
              <span className={`h-2 w-2 rounded-full ${isIndia ? 'bg-orange-400' : 'bg-blue-400'}`} />
              Paying with {isIndia ? 'Razorpay (INR ₹)' : 'PayPal (USD $)'}
              <button
                onClick={() => setProvider(p => p === 'razorpay' ? 'paypal' : 'razorpay')}
                className="ml-1 underline underline-offset-2 hover:text-white"
              >
                Switch
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 mx-auto max-w-md rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {PLANS.map(plan => {
              const isCurrent = currentPlan === plan.key
              const isUpgrade = loading === plan.key

              return (
                <div
                  key={plan.key}
                  className={`relative rounded-xl p-6 ${
                    plan.highlight
                      ? 'border-2 border-brand-500 bg-brand-500/5'
                      : 'border border-white/5 bg-slate-900'
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white whitespace-nowrap">
                      Most popular
                    </div>
                  )}

                  <div className="mb-5">
                    <h2 className="mb-1 text-sm font-semibold text-slate-300">{plan.name}</h2>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">
                        {isIndia ? plan.priceInr : plan.priceUsd}
                      </span>
                      <span className="text-sm text-slate-500">{plan.period}</span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">{plan.description}</p>
                  </div>

                  <ul className="mb-6 space-y-2.5">
                    {plan.features.map(f => (
                      <li key={f.text} className={`flex items-center gap-2.5 text-sm ${f.included ? 'text-slate-300' : 'text-slate-600'}`}>
                        {f.included ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        )}
                        {f.text}
                      </li>
                    ))}
                  </ul>

                  {plan.key === 'free' ? (
                    <div className={`block w-full rounded-lg py-2.5 text-center text-sm font-medium ${isCurrent ? 'border border-white/10 text-slate-500' : 'border border-white/10 text-slate-400 hover:text-white transition'}`}>
                      {isCurrent ? 'Current plan' : 'Get started free'}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.key)}
                      disabled={isUpgrade || isCurrent}
                      className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
                        plan.highlight
                          ? 'bg-brand-500 text-white hover:bg-brand-600'
                          : 'border border-white/10 text-slate-300 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {isUpgrade && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="animate-spin">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2"/>
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      )}
                      {isCurrent ? 'Current plan' : isUpgrade ? 'Processing...' : plan.cta}
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <p className="mt-8 text-center text-xs text-slate-600">
            Payments are processed securely. {isIndia ? 'Powered by Razorpay.' : 'Powered by PayPal.'} Cancel anytime.
          </p>
        </div>
      </div>
    </>
  )
}