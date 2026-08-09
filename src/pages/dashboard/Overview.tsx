import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { metrics, timeRanges, seriesByRange, aiInsights } from '../../data/demo'
import LineChart from '../../components/LineChart'

const seriesMeta = [
  { key: 'daromad', label: 'Daromad', color: 'var(--accent)' },
  { key: 'xarajat', label: 'Xarajatlar', color: 'var(--danger)' },
  { key: 'foyda', label: 'Foyda', color: 'var(--success)' },
]

const toneColor: Record<string, string> = { danger: 'var(--danger)', warning: 'var(--warning)', success: 'var(--success)' }

export default function Overview() {
  const navigate = useNavigate()
  const [range, setRange] = useState('30 kun')
  const [visible, setVisible] = useState<Record<string, boolean>>({ daromad: true, xarajat: true, foyda: true })

  const data = seriesByRange[range]
  const activeSeries = seriesMeta.filter((s) => visible[s.key]).map((s) => ({ ...s, values: data[s.key as 'daromad' | 'xarajat' | 'foyda'] }))

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((m) => (
          <button
            key={m.key}
            onClick={() => navigate(`/dashboard/analytics?tab=${m.key}`)}
            className="rounded-xl border p-4 text-left transition-colors duration-150"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <p className="text-[11.5px]" style={{ color: 'var(--text-tertiary)' }}>
              {m.label}
            </p>
            <p className="font-mono mt-1.5 text-[15px] font-semibold sm:text-lg" style={{ color: 'var(--text-primary)' }}>
              {m.value}
              <span className="ml-1 text-[11px] font-normal" style={{ color: 'var(--text-tertiary)' }}>
                {m.unit}
              </span>
            </p>
            <p className="font-mono mt-2 flex items-center gap-1 text-[11px] font-medium" style={{ color: m.up ? 'var(--success)' : 'var(--danger)' }}>
              {m.up ? '↑' : '↓'} {m.change}
              <span className="font-body font-normal" style={{ color: 'var(--text-tertiary)' }}>
                o‘tgan oyga nisbatan
              </span>
            </p>
          </button>
        ))}
      </div>

      <div className="rounded-xl border p-5 sm:p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            Moliyaviy dinamika
          </h2>
          <div className="flex flex-wrap items-center gap-1.5">
            {seriesMeta.map((s) => (
              <button
                key={s.key}
                onClick={() => setVisible((v) => ({ ...v, [s.key]: !v[s.key] }))}
                className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11.5px] transition-opacity duration-150"
                style={{
                  borderColor: visible[s.key] ? 'var(--border-strong)' : 'var(--border)',
                  color: visible[s.key] ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  opacity: visible[s.key] ? 1 : 0.55,
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex gap-1.5 overflow-x-auto">
          {timeRanges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="shrink-0 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors duration-150"
              style={{
                color: range === r ? 'white' : 'var(--text-secondary)',
                backgroundColor: range === r ? 'var(--accent)' : 'transparent',
              }}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <LineChart series={activeSeries} labels={data.labels} />
        </div>
      </div>

      <div className="rounded-xl border p-5 sm:p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <h2 className="font-display text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          AI tahlili
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {aiInsights.map((it) => (
            <div key={it.id} className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
              <div className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: toneColor[it.tone] }} />
                <div>
                  <p className="text-[13px] font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {it.title}
                  </p>
                  {it.lines.map((l) => (
                    <p key={l} className="mt-1 text-[12px] leading-snug" style={{ color: 'var(--text-tertiary)' }}>
                      {l}
                    </p>
                  ))}
                </div>
              </div>
              <button
                onClick={() => navigate(it.id === 'foyda' ? '/dashboard/analytics?tab=foyda' : '/dashboard/ai')}
                className="mt-3 text-[12px] font-medium"
                style={{ color: 'var(--accent)' }}
              >
                Batafsil ko‘rish →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
