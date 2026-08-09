import { useMemo, useState } from 'react'
import { transactions } from '../../data/demo'

const categories = ['Barchasi', ...Array.from(new Set(transactions.map((t) => t.category)))]

export default function Transactions() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Barchasi')
  const [type, setType] = useState<'Barchasi' | 'Daromad' | 'Xarajat'>('Barchasi')
  const [page, setPage] = useState(1)
  const perPage = 5

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (search && !t.desc.toLowerCase().includes(search.toLowerCase())) return false
      if (category !== 'Barchasi' && t.category !== category) return false
      if (type !== 'Barchasi' && t.type !== type) return false
      return true
    })
  }, [search, category, type])

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage))
  const paged = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="flex flex-col gap-5">
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

        <div className="flex flex-wrap gap-2">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
              setPage(1)
            }}
            className="rounded-lg border px-3 py-2 text-[12.5px] outline-none"
            style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <div className="flex overflow-hidden rounded-lg border" style={{ borderColor: 'var(--border-strong)' }}>
            {(['Barchasi', 'Daromad', 'Xarajat'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(t)
                  setPage(1)
                }}
                className="px-3 py-2 text-[12.5px] font-medium transition-colors duration-150"
                style={{ backgroundColor: type === t ? 'var(--accent)' : 'transparent', color: type === t ? 'white' : 'var(--text-secondary)' }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <table className="w-full min-w-[560px] text-left text-[13px]">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              {['Sana', 'Tavsif', 'Kategoriya', 'Tur', 'Summa'].map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-[11.5px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((t, i) => (
              <tr
                key={t.date + t.desc}
                className="cursor-pointer border-b transition-colors duration-150 last:border-b-0"
                style={{ borderColor: 'var(--border)' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <td className="font-mono whitespace-nowrap px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                  {t.date}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                  {t.desc}
                </td>
                <td className="whitespace-nowrap px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                  {t.category}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={{
                      color: t.type === 'Daromad' ? 'var(--success)' : 'var(--danger)',
                      backgroundColor: t.type === 'Daromad' ? 'color-mix(in srgb, var(--success) 12%, transparent)' : 'color-mix(in srgb, var(--danger) 12%, transparent)',
                    }}
                  >
                    {t.type}
                  </span>
                </td>
                <td className="font-mono whitespace-nowrap px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                  {i === 0 ? t.amount : t.amount}
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                  Hech narsa topilmadi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-[12.5px]" style={{ color: 'var(--text-tertiary)' }}>
        <span>
          {filtered.length} tadan {paged.length ? (page - 1) * perPage + 1 : 0}–{(page - 1) * perPage + paged.length} ko‘rsatilmoqda
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
    </div>
  )
}
