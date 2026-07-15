import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function VerifyOtpPage() {
  const router = useRouter()
  const { user_id, email, type } = router.query as {
    user_id?: string
    email?: string
    type?: 'email_verification' | 'login_2fa'
  }

  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [success, setSuccess] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    setResendCooldown(60)
  }, [])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  function handleInput(index: number, value: string) {
    if (!/^\d?$/.test(value)) return
    const next = [...code]
    next[index] = value
    setCode(next)
    setError('')

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (value && index === 5 && next.every(d => d !== '')) {
      handleVerify(next.join(''))
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = [...code]
    pasted.split('').forEach((d, i) => { if (i < 6) next[i] = d })
    setCode(next)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
    if (pasted.length === 6) {
      handleVerify(pasted)
    }
  }

  async function handleVerify(fullCode: string) {
    if (!user_id || !type) return
    setLoading(true)
    setError('')

    try {
      const endpoint = '/api/auth/verify-email'
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode }),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Invalid code')
        setCode(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
        return
      }

      setSuccess(type === 'email_verification' ? 'Email verified! Redirecting...' : 'Login verified!')

      if (data.data?.session?.access_token) {
        localStorage.setItem('growthauditor_access_token', data.data.session.access_token)
      }

      setTimeout(() => router.push('/dashboard'), 1200)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (type === 'email_verification') {
    const pendingSession = sessionStorage.getItem('pending_session')
    if (pendingSession) {
      const session = JSON.parse(pendingSession)
      localStorage.setItem('growthauditor_access_token', session.access_token)
      sessionStorage.removeItem('pending_session')
    }
  }

  async function handleResend() {
    if (!user_id || !email || !type || resendCooldown > 0) return
    setResending(true)
    setError('')
    try {
      const res: Response = await fetch(`${API_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),

      const data = await res.json()
      if (data.success) {
        setResendCooldown(60)
        setSuccess('New code sent to your email.')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to resend')
      }
    } catch {
      setError('Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  const title = type === 'login_2fa' ? 'Two-factor authentication' : 'Verify your email'
  const description = type === 'login_2fa'
    ? 'Enter the 6-digit code sent to your email to complete login.'
    : 'Enter the 6-digit code we sent to your email to verify your account.'

  return (
    <>
      <Head><title>Verify — GrowthAuditor</title></Head>

      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4">
        <Link href="/" className="mb-8 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M8 5V11M5 6.5L8 5L11 6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-white">GrowthAuditor</span>
        </Link>

        <div className="w-full max-w-sm rounded-xl border border-white/8 bg-slate-900 p-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.66A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
          </div>

          <h1 className="mb-1 text-lg font-semibold text-white">{title}</h1>
          <p className="mb-2 text-sm text-slate-400">{description}</p>
          {email && (
            <p className="mb-6 text-xs text-slate-500">
              Code sent to <span className="text-slate-300">{email}</span>
            </p>
          )}

          {error && (
            <div role="alert" className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div role="status" className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              {success}
            </div>
          )}

          <div className="mb-6 flex gap-2" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleInput(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                disabled={loading}
                className={`h-12 w-full rounded-lg border bg-slate-800 text-center text-lg font-semibold text-white outline-none transition
                  ${digit ? 'border-brand-500' : 'border-white/10'}
                  focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
                  disabled:opacity-50`}
              />
            ))}
          </div>

          <button
            onClick={() => handleVerify(code.join(''))}
            disabled={loading || code.some(d => d === '')}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-spin">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
            {loading ? 'Verifying...' : 'Verify code'}
          </button>

          <div className="text-center text-sm text-slate-500">
            Didn&apos;t get a code?{' '}
            {resendCooldown > 0 ? (
              <span className="text-slate-600">Resend in {resendCooldown}s</span>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-brand-400 transition hover:text-brand-300 disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend code'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}