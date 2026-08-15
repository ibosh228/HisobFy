import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchTransactions, computeMetrics, groupByMonth, groupByCategory, type Transaction } from '../../lib/business'
import LineChart from '../../components/LineChart'

function formatNumber(n: number) {
  return Math.round(n).toLocaleString('en-US')
}

const tabs = [
  { key: 'daromad', label: 'Daromad', color: 'var(--accent)' },
  { key: 'xarajat', label: 'Xarajatlar', color: 'var(--danger)' },
  { key: 'foyda', label: 'Foyda', color: 'var(--success)' },
  { key: 'marja', label: 'Marja', color: 'var(--warning)' },
]

export default function Analytics() {
  const { business, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [transactions, setTransactions] = useState<Transaction[] | null>(null)
  const initialTab = params.get('tab') ?? 'daromad'
  const [tab, setTab] = useState(tabs.some((t) => t.key === initialTab) ? initialTab : 'daromad')

  useEffect(() => {
    if (!business) return
    fetchTransactions(business.id).then(setTransactions)
  }, [business])

  if (authLoading || transactions === null) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <span className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
          Yuklanmoqda…
        </span>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 rounded-xl border px-6 py-16 text-center"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 3v18h18M7 15l4-4 3 3 5-6" />
          </svg>
        </span>
        <p className="font-display text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          Tahlil qilish uchun ma‘lumot yo‘q
        </p>
        <p className="max-w-sm text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
          Excel yoki CSV faylingizni yuklang — batafsil analitika shundan keyin ko‘rinadi.
        </p>
        <button
          onClick={() => navigate('/dashboard/data')}
          className="mt-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition-all duration-200 hover:brightness-110"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Ma‘lumot yuklash
        </button>
      </div>
    )
  }

  const metrics = computeMetrics(transactions)
  const monthly = groupByMonth(transactions)
  const active = tabs.find((t) => t.key === tab)!

  const seriesValues =
    tab === 'daromad' ? monthly.daromad : tab === 'xarajat' ? monthly.xarajat : tab === 'foyda' ? monthly.foyda : monthly.daromad.map((d, i) => (d > 0 ? (monthly.foyda[i] / d) * 100 : 0))

  const mainValue = tab === 'daromad' ? metrics.revenue : tab === 'xarajat' ? metrics.expenses : tab === 'foyda' ? metrics.profit : metrics.margin
  const isPercentTab = tab === 'marja'

  const breakdown = tab === 'xarajat' ? groupByCategory(transactions, 'expense') : tab === 'daromad' ? groupByCategory(transactions, 'income') : []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1.5 overflow-x-auto rounded-lg border p-1" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', width: 'fit-content' }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="shrink-0 rounded-md px-3.5 py-1.5 text-[12.5px] font-medium transition-colors duration-150"
            style={{ color: tab === t.key ? 'white' : 'var(--text-secondary)', backgroundColor: tab === t.key ? 'var(--accent)' : 'transparent' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <p className="text-[11.5px]" style={{ color: 'var(--text-tertiary)' }}>
          {active.label} (jami)
        </p>
        <p className="font-mono mt-1.5 text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {isPercentTab ? mainValue.toFixed(1) : formatNumber(mainValue)}
          <span className="ml-1 text-[13px] font-normal" style={{ color: 'var(--text-tertiary)' }}>
            {isPercentTab ? '%' : 'UZS'}
          </span>
        </p>
      </div>

      <div className="rounded-xl border p-5 sm:p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <h2 className="font-display text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          {active.label} dinamikasi
        </h2>
        <div className="mt-5">
          {monthly.labels.length < 2 ? (
            <p className="text-[12.5px]" style={{ color: 'var(--text-tertiary)' }}>
              Grafik ko‘rsatish uchun kamida 2 oylik ma‘lumot kerak.
            </p>
          ) : (
            <LineChart series={[{ key: tab, label: active.label, color: active.color, values: seriesValues }]} labels={monthly.labels} />
          )}
        </div>
      </div>

      {breakdown.length > 0 && (
        <div className="rounded-xl border p-5 sm:p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          <h2 className="font-display text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            Kategoriya bo‘yicha taqsimot
          </h2>
          <div className="mt-4 flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
            {breakdown.map((b) => (
              <button
                key={b.category}
                onClick={() => navigate(`/dashboard/transactions?category=${encodeURIComponent(b.category)}`)}
                className="flex items-center justify-between py-3 text-left transition-colors duration-150"
                style={{ borderColor: 'var(--border)' }}
              >
                <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                  {b.category}
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-[11.5px]" style={{ color: 'var(--text-tertiary)' }}>
                    {b.share.toFixed(0)}%
                  </span>
                  <span className="font-mono text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    {formatNumber(b.total)} UZS
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
