import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FormEvent, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ApiClientError } from '../lib/apiClient'
import FormInput from '../components/FormInput'
import Spinner from '../components/Spinner'

interface FormErrors {
  email?: string
  password?: string
  form?: string
}

function validate(email: string, password: string): FormErrors {
  const errors: FormErrors = {}
  if (!email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address'
  }
  if (!password) {
    errors.password = 'Password is required'
  }
  return errors
}

export default function LoginPage() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const next = typeof router.query.next === 'string' ? router.query.next : '/dashboard'
      router.replace(next)
    }
  }, [authLoading, isAuthenticated, router])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const validationErrors = validate(email, password)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    try {
      await login(email.trim(), password)
      const next = typeof router.query.next === 'string' ? router.query.next : '/dashboard'
      router.push(next)
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : 'Login failed. Please try again.'
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
        <title>Sign in — GrowthAuditor</title>
        <meta name="description" content="Sign in to your GrowthAuditor account." />
      </Head>

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
          <h1 className="mb-1 text-lg font-semibold text-white">Welcome back</h1>
          <p className="mb-6 text-sm text-slate-400">Sign in to your account</p>

          {errors.form && (
            <div role="alert" className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="current-password"
              disabled={submitting}
            />

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Spinner size={16} />}
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            No account?{' '}
            <Link href="/signup" className="text-brand-400 transition hover:text-brand-300">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
