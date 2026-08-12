import { useState } from 'react'

export default function DataPage() {
  const [dragOver, setDragOver] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div
        className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors duration-150"
        style={{ borderColor: dragOver ? 'var(--accent)' : 'var(--border-strong)', backgroundColor: dragOver ? 'var(--accent-soft)' : 'var(--surface)' }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
        }}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 9l5-5 5 5M12 4v12" />
          </svg>
        </span>
        <p className="font-display text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          Excel yoki CSV faylni yuklang
        </p>
        <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
          Faylni shu yerga tashlang yoki tanlang
        </p>
        <button
          type="button"
          className="mt-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition-all duration-200 hover:brightness-110"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Fayl tanlash
        </button>
      </div>

      <div>
        <h2 className="font-display text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          Yuklangan fayllar
        </h2>
        <p className="mt-3 rounded-lg border px-4 py-3 text-[13px]" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-tertiary)' }}>
          Hali fayl yuklanmagan. Fayl yuklash funksiyasi tez orada ishga tushadi.
        </p>
      </div>
    </div>
  )
}
