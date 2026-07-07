import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function PaymentSuccess() {
  const router = useRouter()
  const { token: paypalToken } = router.query
  const [status, setStatus] = useState<'capturing' | 'success' | 'error'>('capturing')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!paypalToken) return
    const accessToken = localStorage.getItem('growthauditor_access_token')
    if (!accessToken) { router.push('/login'); return }

    const urlParams = new URLSearchParams(window.location.search)
    const orderId = urlParams.get('token')

    if (!orderId) { setStatus('error'); return }

    fetch(`${API_URL}/api/payment/capture-paypal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ order_id: orderId }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) setStatus('success')
        else { setStatus('error'); setError(d.error || 'Capture failed') }
      })
      .catch(() => { setStatus('error'); setError('Something went wrong') })
  }, [paypalToken, router])

  return (
    <>
      <Head><title>Payment — GrowthAuditor</title></Head>
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center">
        {status === 'capturing' && (
          <>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="animate-spin mb-4 text-brand-500">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p className="text-sm text-slate-400">Confirming your payment...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 className="mb-2 text-xl font-bold text-white">Payment successful!</h1>
            <p className="mb-6 text-sm text-slate-400">Your plan has been activated.</p>
            <Link href="/dashboard" className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition">
              Go to Dashboard
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h1 className="mb-2 text-lg font-bold text-white">Payment failed</h1>
            <p className="mb-6 text-sm text-slate-400">{error || 'Something went wrong. Please contact support.'}</p>
            <Link href="/pricing" className="text-sm text-brand-400 hover:text-brand-300 transition">
              ← Back to pricing
            </Link>
          </>
        )}
      </div>
    </>
  )
}