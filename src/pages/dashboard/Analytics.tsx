import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { timeRanges, seriesByRange } from '../../data/demo'
import LineChart from '../../components/LineChart'

const tabs = [
  { key: 'daromad', label: 'Daromad', color: 'var(--accent)', value: '82.45M UZS', change: '+12.4%', up: true, best: 'May → Iyun' },
  { key: 'xarajat', label: 'Xarajatlar', color: 'var(--danger)', value: '64.20M UZS', change: '+21.7%', up: true, best: 'Iyul → Avgust' },
  { key: 'foyda', label: 'Foyda', color: 'var(--success)', value: '18.25M UZS', change: '-8.2%', up: false, best: 'Apr → May' },
  { key: 'marja', label: 'Marja', color: 'var(--warning)', value: '22.1%', change: '-3.4%', up: false, best: 'Mar → Apr' },
]

const breakdownByTab: Record<string, { label: string; change: string }[]> = {
  foyda: [
    { label: 'Xarajatlar', change: '+21.7%' },
    { label: 'Marketing', change: '+41%' },
    { label: 'Yetkazib beruvchilar', change: '+19%' },
    { label: 'Daromad', change: '+12.4%' },
  ],
  daromad: [
    { label: 'Sotuv', change: '+14%' },
    { label: 'Xizmat ko‘rsatish', change: '+9%' },
  ],
  xarajat: [
    { label: 'Marketing', change: '+41%' },
    { label: 'Yetkazib beruvchilar', change: '+19%' },
    { label: 'Ijara', change: '+4%' },
  ],
  marja: [
    { label: 'Xarajat/Daromad nisbati', change: '+6.1%' },
  ],
}

export default function Analytics() {
  const [params] = useSearchParams()
  const initialTab = params.get('tab') ?? 'daromad'
  const [tab, setTab] = useState(tabs.some((t) => t.key === initialTab) ? initialTab : 'daromad')
  const [range, setRange] = useState('30 kun')

  const active = tabs.find((t) => t.key === tab)!
  const data = seriesByRange[range]
  const values = tab === 'marja' ? data.foyda.map((v, i) => Math.round((v / (data.daromad[i] || 1)) * 100)) : data[tab as 'daromad' | 'xarajat' | 'foyda']

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1.5 overflow-x-auto rounded-lg border p-1" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', width: 'fit-content' }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="shrink-0 rounded-md px-3.5 py-1.5 text-[12.5px] font-medium transition-colors duration-150"
            style={{
              color: tab === t.key ? 'white' : 'var(--text-secondary)',
              backgroundColor: tab === t.key ? 'var(--accent)' : 'transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          <p className="text-[11.5px]" style={{ color: 'var(--text-tertiary)' }}>
            {active.label}
          </p>
          <p className="font-mono mt-1.5 text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {active.value}
          </p>
          <p className="font-mono mt-2 text-[12px] font-medium" style={{ color: active.up ? 'var(--success)' : 'var(--danger)' }}>
            {active.change}
          </p>
        </div>
        <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          <p className="text-[11.5px]" style={{ color: 'var(--text-tertiary)' }}>
            Eng katta o‘sish
          </p>
          <p className="font-display mt-1.5 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {active.best}
          </p>
        </div>
        <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          <p className="text-[11.5px]" style={{ color: 'var(--text-tertiary)' }}>
            Oldingi davr bilan solishtirma
          </p>
          <p className="font-mono mt-1.5 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {range}
          </p>
        </div>
      </div>

      <div className="rounded-xl border p-5 sm:p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            {active.label} dinamikasi
          </h2>
          <div className="flex gap-1.5 overflow-x-auto">
            {[...timeRanges, 'Maxsus davr'].map((r) => (
              <button
                key={r}
                onClick={() => timeRanges.includes(r) && setRange(r)}
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
        </div>
        <div className="mt-5">
          <LineChart series={[{ key: tab, label: active.label, color: active.color, values }]} labels={data.labels} />
        </div>
      </div>

      <div className="rounded-xl border p-5 sm:p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <h2 className="font-display text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          Kategoriya bo‘yicha taqsimot
        </h2>
        <div className="mt-4 flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
          {(breakdownByTab[tab] ?? []).map((b) => (
            <div key={b.label} className="flex items-center justify-between py-3" style={{ borderColor: 'var(--border)' }}>
              <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                {b.label}
              </span>
              <span className="font-mono text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                {b.change}
              </span>
            </div>
          ))}
        </div>

        {tab === 'foyda' && (
          <div className="mt-5 rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
            <p className="text-[12px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
              AI izohi
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Foyda kamayishining asosiy sababi xarajatlarning daromadga nisbatan tezroq o‘sishidir.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
