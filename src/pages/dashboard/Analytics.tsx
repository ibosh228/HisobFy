import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchTransactions, type Transaction } from '../../lib/business'

export default function Analytics() {
  const { business, loading: authLoading } = useAuth()
  const navigate = useNavigate()
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

  return (
    <div className="rounded-xl border p-6 text-[13px]" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-secondary)' }}>
      Batafsil analitika tez orada shu yerda ko‘rinadi.
    </div>
  )
}
