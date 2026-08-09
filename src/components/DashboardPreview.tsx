import { useEffect, useState } from 'react'

const metrics = [
  { label: 'Daromad', value: '82,450,000', unit: 'UZS', change: '12.4%', up: true },
  { label: 'Foyda', value: '18,250,000', unit: 'UZS', change: '8.2%', up: false },
  { label: 'Xarajatlar', value: '64,200,000', unit: 'UZS', change: '21.7%', up: true },
  { label: 'Foyda marjasi', value: '22.1', unit: '%', change: '3.4%', up: false },
]

const insights = [
  { color: 'var(--danger)', title: 'Foyda 8.2% ga kamaygan', detail: 'Asosiy sabab: xarajatlar 21.7% ga oshgan' },
  { color: 'var(--warning)', title: 'Marketing xarajatlari oshgan', detail: '41% ga oshgan, lekin savdo 6% ga oshgan' },
  { color: 'var(--success)', title: 'Daromad o‘sishda', detail: 'O‘tgan oyga nisbatan 12.4% ga oshgan' },
]

const months = ['Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg']
const revenuePoints = [40, 52, 58, 66, 74, 88]
const profitPoints = [22, 20, 24, 23, 27, 30]

function buildPath(points: number[], width: number, height: number) {
  const max = 100
  const step = width / (points.length - 1)
  return points
    .map((p, i) => {
      const x = i * step
      const y = height - (p / max) * height
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

export default function DashboardPreview() {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 500)
    return () => clearTimeout(t)
  }, [])

  const width = 300
  const height = 100

  return (
    <div
      className="w-full rounded-2xl border p-5 sm:p-6"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-md)' }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
          Umumiy ko‘rinish
        </h3>
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-medium"
          style={{ color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          Avgust 2026
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className="rounded-xl border p-3.5 transition-all duration-700"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--bg-elevated)',
              opacity: animated ? 1 : 0,
              transform: animated ? 'translateY(0)' : 'translateY(8px)',
              transitionDelay: `${i * 90}ms`,
            }}
          >
            <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
              {m.label}
            </p>
            <p className="font-mono mt-1.5 text-[15px] font-semibold leading-none sm:text-lg" style={{ color: 'var(--text-primary)' }}>
              {m.value}
              <span className="ml-1 text-[11px] font-normal" style={{ color: 'var(--text-tertiary)' }}>
                {m.unit}
              </span>
            </p>
            <p
              className="font-mono mt-2 flex items-center gap-1 text-[11px] font-medium"
              style={{ color: m.up ? 'var(--success)' : 'var(--danger)' }}
            >
              {m.up ? '↑' : '↓'} {m.change}
              <span className="font-body font-normal" style={{ color: 'var(--text-tertiary)' }}>
                o‘tgan oyga nisbatan
              </span>
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr]">
        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
          <p className="mb-3 text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
            AI tahlili
          </p>
          <div className="flex flex-col gap-3">
            {insights.map((it, i) => (
              <div
                key={it.title}
                className="flex items-start gap-2.5 transition-all duration-700"
                style={{
                  opacity: animated ? 1 : 0,
                  transform: animated ? 'translateX(0)' : 'translateX(-6px)',
                  transitionDelay: `${400 + i * 110}ms`,
                }}
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: it.color }} />
                <div>
                  <p className="text-[12.5px] font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {it.title}
                  </p>
                  <p className="mt-0.5 text-[11.5px] leading-snug" style={{ color: 'var(--text-tertiary)' }}>
                    {it.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <a href="#" className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium" style={{ color: 'var(--accent)' }}>
            Barcha tahlillar →
          </a>
        </div>

        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
          <div className="mb-2 flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
              <span className="h-1.5 w-3 rounded-full" style={{ backgroundColor: 'var(--accent)' }} /> Daromad
            </span>
            <span className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
              <span className="h-1.5 w-3 rounded-full" style={{ backgroundColor: 'var(--success)' }} /> Foyda
            </span>
          </div>
          <svg viewBox={`0 0 ${width} ${height}`} className="mt-2 w-full" style={{ height: 90 }}>
            <path
              d={buildPath(revenuePoints, width, height)}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 400,
                strokeDashoffset: animated ? 0 : 400,
                transition: 'stroke-dashoffset 1.1s cubic-bezier(0.16,1,0.3,1) 0.5s',
              }}
            />
            <path
              d={buildPath(profitPoints, width, height)}
              fill="none"
              stroke="var(--success)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 400,
                strokeDashoffset: animated ? 0 : 400,
                transition: 'stroke-dashoffset 1.1s cubic-bezier(0.16,1,0.3,1) 0.65s',
              }}
            />
          </svg>
          <div className="mt-1 flex justify-between text-[10.5px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
            {months.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
