import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchTransactions, computeMetrics, groupByMonth, groupByCategory, type Transaction } from '../../lib/business'
import LineChart from '../../components/LineChart'

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
  const monthly = groupByMonth(transactions)
  const topExpenseCategories = groupByCategory(transactions, 'expense')
  const topIncomeCategories = groupByCategory(transactions, 'income')

  const cards = [
    { label: 'Daromad', value: metrics.revenue, unit: 'UZS' },
    { label: 'Foyda', value: metrics.profit, unit: 'UZS' },
    { label: 'Xarajatlar', value: metrics.expenses, unit: 'UZS' },
    { label: 'Foyda marjasi', value: metrics.margin, unit: '%', isPercent: true },
  ]

  const insights: { title: string; detail: string; color: string }[] = []

  if (topExpenseCategories.length > 0) {
    const top = topExpenseCategories[0]
    insights.push({
      title: `Eng katta xarajat: ${top.category}`,
      detail: `Jami xarajatlarning ${top.share.toFixed(0)}% ni tashkil qiladi (${formatNumber(top.total)} UZS).`,
      color: 'var(--danger)',
    })
  }

  if (metrics.expenses > metrics.revenue) {
    insights.push({
      title: 'Xarajatlar daromaddan yuqori',
      detail: 'Bu davrda xarajatlar daromaddan ko‘p bo‘lgan — moliyaviy holatni ko‘rib chiqish tavsiya etiladi.',
      color: 'var(--warning)',
    })
  } else if (metrics.margin > 0) {
    insights.push({
      title: 'Ijobiy foyda marjasi',
      detail: `Joriy foyda marjasi ${metrics.margin.toFixed(1)}% ni tashkil qiladi.`,
      color: 'var(--success)',
    })
  }

  if (topIncomeCategories.length > 0) {
    const top = topIncomeCategories[0]
    insights.push({
      title: `Eng katta daromad manbai: ${top.category}`,
      detail: `Jami daromadning ${top.share.toFixed(0)}% ni tashkil qiladi.`,
      color: 'var(--accent)',
    })
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
            <p className="text-[11.5px]" style={{ color: 'var(--text-tertiary)' }}>
              {c.label}
            </p>
            <p className="font-mono mt-1.5 text-[15px] font-semibold sm:text-lg" style={{ color: 'var(--text-primary)' }}>
              {c.isPercent ? c.value.toFixed(1) : formatNumber(c.value)}
              <span className="ml-1 text-[11px] font-normal" style={{ color: 'var(--text-tertiary)' }}>
                {c.unit}
              </span>
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          <p className="text-[12.5px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
            AI tahlili
          </p>
          <div className="mt-3 flex flex-col gap-3">
            {insights.length === 0 ? (
              <p className="text-[12.5px]" style={{ color: 'var(--text-tertiary)' }}>
                Xulosa chiqarish uchun ma‘lumot yetarli emas.
              </p>
            ) : (
              insights.map((it) => (
                <div key={it.title} className="flex items-start gap-2.5">
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
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          <p className="mb-2 text-[12.5px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
            Moliyaviy dinamika
          </p>
          {monthly.labels.length < 2 ? (
            <p className="mt-6 text-[12.5px]" style={{ color: 'var(--text-tertiary)' }}>
              Grafik ko‘rsatish uchun kamida 2 oylik ma‘lumot kerak.
            </p>
          ) : (
            <LineChart
              series={[
                { key: 'daromad', label: 'Daromad', color: 'var(--accent)', values: monthly.daromad },
                { key: 'foyda', label: 'Foyda', color: 'var(--success)', values: monthly.foyda },
              ]}
              labels={monthly.labels}
            />
          )}
        </div>
      </div>
    </div>
  )
}
