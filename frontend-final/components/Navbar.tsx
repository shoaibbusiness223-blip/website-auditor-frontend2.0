import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthenticated, isLoading, user, logout } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-16 items-center justify-between">

          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M8 5V11M5 6.5L8 5L11 6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">GrowthAuditor</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <a href="/#how-it-works" className="text-sm text-slate-400 transition hover:text-white">How it works</a>
            <a href="/#scores" className="text-sm text-slate-400 transition hover:text-white">What we audit</a>
            <a href="/#pricing" className="text-sm text-slate-400 transition hover:text-white">Pricing</a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isLoading ? null : isAuthenticated ? (
              <>
                <span className="text-xs text-slate-500 truncate max-w-[160px]">{user?.email}</span>
                <Link
                  href="/dashboard"
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="text-sm text-slate-400 transition hover:text-white"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-slate-400 transition hover:text-white">
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 active:scale-95"
                >
                  Get started free
                </Link>
              </>
            )}
          </div>

          <button
            className="flex items-center justify-center rounded-md p-2 text-slate-400 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/5 bg-slate-950 px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <a href="/#how-it-works" className="text-sm text-slate-400" onClick={() => setMobileOpen(false)}>How it works</a>
            <a href="/#scores" className="text-sm text-slate-400" onClick={() => setMobileOpen(false)}>What we audit</a>
            <a href="/#pricing" className="text-sm text-slate-400" onClick={() => setMobileOpen(false)}>Pricing</a>
            <div className="mt-2 flex flex-col gap-3 border-t border-white/5 pt-4">
              {isLoading ? null : isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="text-sm text-slate-300" onClick={() => setMobileOpen(false)}>
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { setMobileOpen(false); logout() }}
                    className="text-left text-sm text-slate-400"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm text-slate-400" onClick={() => setMobileOpen(false)}>
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-center text-sm font-medium text-white"
                  >
                    Get started free
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
