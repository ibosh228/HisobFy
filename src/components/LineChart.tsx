import { useMemo, useState } from 'react'

interface Series {
  key: string
  label: string
  color: string
  values: number[]
}

export default function LineChart({ series, labels }: { series: Series[]; labels: string[] }) {
  const width = 640
  const height = 220
  const padding = 8
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  const max = useMemo(() => Math.max(...series.flatMap((s) => s.values), 10), [series])

  const toXY = (values: number[], i: number) => {
    const step = (width - padding * 2) / (values.length - 1)
    const x = padding + i * step
    const y = height - padding - (values[i] / max) * (height - padding * 2)
    return [x, y]
  }

  const buildPath = (values: number[]) =>
    values
      .map((_, i) => {
        const [x, y] = toXY(values, i)
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const relX = ((e.clientX - rect.left) / rect.width) * width
    const step = (width - padding * 2) / (labels.length - 1)
    const idx = Math.round((relX - padding) / step)
    setHoverIdx(Math.max(0, Math.min(labels.length - 1, idx)))
  }

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full cursor-crosshair"
        style={{ height: 220 }}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={padding}
            x2={width - padding}
            y1={padding + f * (height - padding * 2)}
            y2={padding + f * (height - padding * 2)}
            stroke="var(--border)"
            strokeWidth="1"
          />
        ))}

        {series.map((s) => (
          <path key={s.key} d={buildPath(s.values)} fill="none" stroke={s.color} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        ))}

        {hoverIdx !== null && (
          <>
            <line
              x1={toXY(series[0].values, hoverIdx)[0]}
              x2={toXY(series[0].values, hoverIdx)[0]}
              y1={padding}
              y2={height - padding}
              stroke="var(--border-strong)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            {series.map((s) => {
              const [x, y] = toXY(s.values, hoverIdx)
              return <circle key={s.key} cx={x} cy={y} r="3.5" fill={s.color} />
            })}
          </>
        )}
      </svg>

      <div className="mt-1 flex justify-between text-[10.5px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>

      {hoverIdx !== null && (
        <div className="mt-3 flex flex-wrap gap-4 rounded-lg border px-3 py-2 text-[12px]" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
          <span style={{ color: 'var(--text-tertiary)' }}>{labels[hoverIdx]}</span>
          {series.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5 font-mono" style={{ color: 'var(--text-primary)' }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label}: {s.values[hoverIdx]}M
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
