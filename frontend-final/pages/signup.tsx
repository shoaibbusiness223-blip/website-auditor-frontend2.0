import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FormEvent, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ApiClientError } from '../lib/apiClient'
import FormInput from '../components/FormInput'
import Spinner from '../components/Spinner'

interface FormErrors {
  fullName?: string
  email?: string
  password?: string
  form?: string
}

// Mirrors backend src/validators/index.ts → validateSignup exactly:
// - email: valid email
// - password: min 8 chars, at least one uppercase letter, at least one number
function validate(fullName: string, email: string, password: string): FormErrors {
  const errors: FormErrors = {}

  if (!fullName.trim()) {
    errors.fullName = 'Name is required'
  }

  if (!email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address'
  }

  if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  } else if (!/[A-Z]/.test(password)) {
    errors.password = 'Password must contain an uppercase letter'
  } else if (!/[0-9]/.test(password)) {
    errors.password = 'Password must contain a number'
  }

  return errors
}

export default function SignupPage() {
  const { signup, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Already signed in → don't show the signup form
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [authLoading, isAuthenticated, router])

  // Preserve ?url= from the landing page hero so we can resume the
  // intended audit once the account is created.
  useEffect(() => {
    const pendingUrl = router.query.url
    if (typeof pendingUrl === 'string' && pendingUrl) {
      sessionStorage.setItem('growthauditor_pending_url', pendingUrl)
    }
  }, [router.query.url])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const validationErrors = validate(fullName, email, password)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    setSuccessMessage('')
    try {

      const result = await signup(email.trim(), password, fullName.trim())
      setSuccessMessage('Account created! Check your email for a code...')
      router.push(`/auth/verify-otp?user_id=${result.user.id}&email=${encodeURIComponent(email)}&type=email_verification`)

      sessionStorage.setItem('pending_session', JSON.stringify(result.session))

    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : 'Signup failed. Please try again.'
      setErrors({ form: message })
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Spinner size={28} />
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Create account — GrowthAuditor</title>
        <meta name="description" content="Create your free GrowthAuditor account and start auditing websites in seconds." />
      </Head>

      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-12">
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
          <h1 className="mb-1 text-lg font-semibold text-white">Create your account</h1>
          <p className="mb-6 text-sm text-slate-400">Free forever — no credit card needed</p>

          {errors.form && (
            <div role="alert" className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {errors.form}
            </div>
          )}
          {successMessage && (
            <div role="status" className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <FormInput
              label="Full name"
              type="text"
              name="fullName"
              placeholder="Jane Smith"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              error={errors.fullName}
              autoComplete="name"
              disabled={submitting}
            />
            <FormInput
              label="Email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
              disabled={submitting}
            />
            <FormInput
              label="Password"
              type="password"
              name="password"
              placeholder="Min. 8 chars, 1 uppercase, 1 number"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="new-password"
              disabled={submitting}
            />

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Spinner size={16} />}
              {submitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-400 transition hover:text-brand-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
