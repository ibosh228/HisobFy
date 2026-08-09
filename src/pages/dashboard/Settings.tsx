import { useState } from 'react'
import ThemeToggle from '../../components/ThemeToggle'

const sections = ['Profil', 'Biznes', 'Ko‘rinish', 'Bildirishnomalar']

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px]">
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <input
        defaultValue={value}
        className="rounded-lg border px-3.5 py-2.5 text-[13px] outline-none"
        style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
      />
    </label>
  )
}

export default function Settings() {
  const [active, setActive] = useState(sections[0])

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex gap-1.5 overflow-x-auto lg:w-48 lg:flex-col">
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => setActive(s)}
            className="shrink-0 rounded-lg px-3.5 py-2.5 text-left text-[13px] font-medium transition-colors duration-150"
            style={{
              color: active === s ? 'var(--accent)' : 'var(--text-secondary)',
              backgroundColor: active === s ? 'var(--accent-soft)' : 'transparent',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex-1 rounded-xl border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        {active === 'Profil' && (
          <div className="flex max-w-sm flex-col gap-4">
            <Field label="Ism" value="Demo User" />
            <Field label="Email" value="demo@example.com" />
            <button className="mt-2 w-fit rounded-lg px-4 py-2 text-[13px] font-semibold text-white" style={{ backgroundColor: 'var(--accent)' }}>
              Saqlash
            </button>
          </div>
        )}
        {active === 'Biznes' && (
          <div className="flex max-w-sm flex-col gap-4">
            <Field label="Biznes nomi" value="Demo Business" />
            <Field label="Soha" value="Chakana savdo" />
            <button className="mt-2 w-fit rounded-lg px-4 py-2 text-[13px] font-semibold text-white" style={{ backgroundColor: 'var(--accent)' }}>
              Saqlash
            </button>
          </div>
        )}
        {active === 'Ko‘rinish' && (
          <div className="flex flex-col gap-4">
            <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
              Mavzu
            </p>
            <ThemeToggle />
          </div>
        )}
        {active === 'Bildirishnomalar' && (
          <div className="flex max-w-sm flex-col gap-4">
            {['Email orqali xabar berish', 'Haftalik hisobot', 'AI tavsiyalar'].map((n) => (
              <label key={n} className="flex items-center justify-between text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                {n}
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--accent)]" />
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
