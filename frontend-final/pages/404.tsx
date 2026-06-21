import Head from 'next/head'
import Link from 'next/link'

export default function NotFound() {
  return (
    <>
      <Head><title>404 — GrowthAuditor</title></Head>
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center">
        <p className="mb-2 font-mono text-xs text-slate-600">404</p>
        <h1 className="mb-2 text-2xl font-bold text-white">Page not found</h1>
        <p className="mb-8 text-sm text-slate-400">The page you're looking for doesn't exist.</p>
        <Link href="/" className="text-sm text-brand-400 hover:text-brand-300 transition">
          ← Back to home
        </Link>
      </div>
    </>
  )
}
