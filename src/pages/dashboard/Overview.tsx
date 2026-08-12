import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchTransactions, computeMetrics, type Transaction } from '../../lib/business'

function formatNumber(n: number) {
  return Math.round(n).toLocaleString('en-US')
}

function EmptyState() {
  const navigate = useNavigate()
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-xl border px-6 py-16 text-center"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 9l5-5 5 5M12 4v12" />
        </svg>
      </span>
      <p className="font-display text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        Hali moliyaviy ma‘lumot yo‘q
      </p>
      <p className="max-w-sm text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
        Excel yoki CSV faylingizni yuklang — shundan keyin bu yerda biznesingizning haqiqiy ko‘rsatkichlari paydo bo‘ladi.
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

export default function Overview() {
  const { business, loading: authLoading } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[] | null>(null)

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
    return <EmptyState />
  }

  const metrics = computeMetrics(transactions)
  const cards = [
    { label: 'Daromad', value: metrics.revenue },
    { label: 'Xarajatlar', value: metrics.expenses },
    { label: 'Foyda', value: metrics.profit },
    { label: 'Foyda marjasi', value: metrics.margin, isPercent: true },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
            <p className="text-[11.5px]" style={{ color: 'var(--text-tertiary)' }}>
              {c.label}
            </p>
            <p className="font-mono mt-1.5 text-[15px] font-semibold sm:text-lg" style={{ color: 'var(--text-primary)' }}>
              {c.isPercent ? c.value.toFixed(1) : formatNumber(c.value)}
              <span className="ml-1 text-[11px] font-normal" style={{ color: 'var(--text-tertiary)' }}>
                {c.isPercent ? '%' : 'UZS'}
              </span>
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border p-5 sm:p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <h2 className="font-display text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          AI tahlili
        </h2>
        <p className="mt-2 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
          AI tahlili hozircha ishlab chiqilmoqda — tez orada shu yerda avtomatik tushuntirishlar paydo bo‘ladi.
        </p>
      </div>
    </div>
  )
}
