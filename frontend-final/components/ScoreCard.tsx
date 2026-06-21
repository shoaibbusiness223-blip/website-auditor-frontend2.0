interface ScoreCardProps {
  label: string
  score: number
  color: string
  bgColor: string
  description: string
  icon: React.ReactNode
}

export default function ScoreCard({ label, score, color, bgColor, description, icon }: ScoreCardProps) {
  const circumference = 2 * Math.PI * 28
  const dashOffset = circumference - (score / 100) * circumference

  return (
    <div className="card-border rounded-xl bg-slate-900/60 p-6 transition hover:bg-slate-900">
      <div className="mb-4 flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bgColor}`}>
          {icon}
        </div>
        {/* Mini circular score */}
        <svg width="48" height="48" viewBox="0 0 64 64" className="-mr-1 -mt-1">
          <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5"/>
          <circle
            cx="32" cy="32" r="28"
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 32 32)"
          />
          <text x="32" y="37" textAnchor="middle" fontSize="13" fontWeight="600" fill="white">{score}</text>
        </svg>
      </div>
      <h3 className="mb-1 text-base font-semibold text-white">{label}</h3>
      <p className="text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  )
}
