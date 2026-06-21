import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-950 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M8 5V11M5 6.5L8 5L11 6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">GrowthAuditor</span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/privacy" className="text-sm text-slate-500 transition hover:text-slate-300">Privacy</Link>
            <Link href="/terms" className="text-sm text-slate-500 transition hover:text-slate-300">Terms</Link>
            <a href="mailto:hello@growthanditor.com" className="text-sm text-slate-500 transition hover:text-slate-300">Contact</a>
          </nav>

          <p className="text-sm text-slate-600">© 2025 GrowthAuditor. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
