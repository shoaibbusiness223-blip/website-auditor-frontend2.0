interface ScoreRingProps {
  score: number
  label: string
  colorVar?: string
  size?: number
}

const CATEGORY_COLORS: Record<string, string> = {
  SEO: '#818cf8',
  Conversion: '#34d399',
  Trust: '#fb923c',
  Copywriting: '#f472b6',
  Overall: '#a78bfa',
}

export default function ScoreRing({ score, label, size = 84 }: ScoreRingProps) {
  const safeScore = Math.max(0, Math.min(100, score ?? 0))
  const r = size / 2 - 6
  const circumference = 2 * Math.PI * r
  const offset = circumference - (safeScore / 100) * circumference
  const color = CATEGORY_COLORS[label] || '#818cf8'
  const fontSize = size < 60 ? 11 : size < 90 ? 14 : 18

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
        />
        <text
          x={size / 2}
          y={size / 2 + fontSize * 0.35}
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight={600}
          fill="white"
        >
          {safeScore}
        </text>
      </svg>
      <span className="text-xs font-medium text-slate-400">{label}</span>
    </div>
  )
}
