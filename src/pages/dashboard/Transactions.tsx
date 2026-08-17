import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { fetchTransactions, deleteTransaction, type Transaction } from '../../lib/business'

export default function Transactions() {
  const { business } = useAuth()
  const { showToast } = useToast()
  const [params] = useSearchParams()
  const [transactions, setTransactions] = useState<Transaction[] | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(params.get('category') ?? '')
  const [type, setType] = useState<'Barchasi' | 'income' | 'expense'>('Barchasi')
  const [page, setPage] = useState(1)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const perPage = 8

  useEffect(() => {
    if (!business) return
    fetchTransactions(business.id).then(setTransactions)
  }, [business])

  const filtered = useMemo(() => {
    if (!transactions) return []
    return transactions.filter((t) => {
      if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false
      if (category && t.category !== category) return false
      if (type !== 'Barchasi' && t.type !== type) return false
      return true
    })
  }, [transactions, search, category, type])

  const handleDelete = async (id: string) => {
    setDeleting(true)
    const { error } = await deleteTransaction(id)
    setDeleting(false)
    setConfirmId(null)

    if (error) {
      showToast('Xatolik yuz berdi', 'error')
      return
    }

    setTransactions((prev) => (prev ? prev.filter((t) => t.id !== id) : prev))
    showToast('Tranzaksiya o‘chirildi')
  }

  if (transactions === null) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <span className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
          Yuklanmoqda…
        </span>
      </div>
    )
  }

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage))
  const paged = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="flex flex-col gap-5">
      {category && (
        <div className="flex items-center gap-2 text-[12.5px]" style={{ color: 'var(--text-secondary)' }}>
          Filtr:
          <span
            className="flex items-center gap-1.5 rounded-full border px-2.5 py-1"
            style={{ borderColor: 'var(--accent-border)', backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            {category}
            <button onClick={() => setCategory('')} aria-label="Filtrni tozalash">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </span>
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.8" className="absolute left-3 top-1/2 -translate-y-1/2">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Qidirish..."
            className="w-full rounded-lg border py-2 pl-9 pr-3 text-[13px] outline-none"
            style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}
          />
        </div>

        <div className="flex overflow-hidden rounded-lg border" style={{ borderColor: 'var(--border-strong)' }}>
          {(['Barchasi', 'income', 'expense'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setType(t)
                setPage(1)
              }}
              className="px-3 py-2 text-[12.5px] font-medium transition-colors duration-150"
              style={{ backgroundColor: type === t ? 'var(--accent)' : 'transparent', color: type === t ? 'white' : 'var(--text-secondary)' }}
            >
              {t === 'Barchasi' ? 'Barchasi' : t === 'income' ? 'Daromad' : 'Xarajat'}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <table className="w-full min-w-[620px] text-left text-[13px]">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              {['Sana', 'Tavsif', 'Kategoriya', 'Tur', 'Summa', ''].map((h, i) => (
                <th key={i} className="whitespace-nowrap px-4 py-3 text-[11.5px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((t) => (
              <tr key={t.id} className="border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                <td className="font-mono whitespace-nowrap px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                  {t.date}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                  {t.description}
                </td>
                <td className="whitespace-nowrap px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                  {t.category}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={{
                      color: t.type === 'income' ? 'var(--success)' : 'var(--danger)',
                      backgroundColor: t.type === 'income' ? 'color-mix(in srgb, var(--success) 12%, transparent)' : 'color-mix(in srgb, var(--danger) 12%, transparent)',
                    }}
                  >
                    {t.type === 'income' ? 'Daromad' : 'Xarajat'}
                  </span>
                </td>
                <td className="font-mono whitespace-nowrap px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                  {Math.round(t.amount).toLocaleString('en-US')} {t.currency}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <button
                    onClick={() => setConfirmId(t.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-md"
                    style={{ color: 'var(--text-tertiary)' }}
                    aria-label="O‘chirish"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                  Hali tranzaksiya yo‘q. Ma‘lumotlar sahifasidan Excel/CSV yuklang.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between text-[12.5px]" style={{ color: 'var(--text-tertiary)' }}>
          <span>
            {filtered.length} tadan {(page - 1) * perPage + 1}–{(page - 1) * perPage + paged.length} ko‘rsatilmoqda
          </span>
          <div className="flex gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-md border px-3 py-1.5 disabled:opacity-40"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
            >
              Oldingi
            </button>
            <button
              disabled={page >= pageCount}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border px-3 py-1.5 disabled:opacity-40"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
            >
              Keyingi
            </button>
          </div>
        </div>
      )}

      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-sm rounded-xl border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
            <p className="font-display text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              Tranzaksiyani o‘chirasizmi?
            </p>
            <p className="mt-2 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
              Bu amalni orqaga qaytarib bo‘lmaydi.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmId(null)}
                className="rounded-lg border px-4 py-2 text-[13px] font-medium"
                style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
              >
                Bekor qilish
              </button>
              <button
                onClick={() => handleDelete(confirmId)}
                disabled={deleting}
                className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: 'var(--danger)' }}
              >
                {deleting ? 'O‘chirilmoqda…' : 'O‘chirish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
