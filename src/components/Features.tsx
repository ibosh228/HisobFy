import { useReveal } from '../hooks/useReveal'

function MiniTrendVisual() {
  return (
    <svg viewBox="0 0 220 70" className="w-full" style={{ height: 64 }}>
      <path
        d="M4,52 L34,42 L64,46 L94,30 L124,34 L154,16 L184,22 L216,8"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {[4, 34, 64, 94, 124, 154, 184, 216].map((x, i) => {
        const ys = [52, 42, 46, 30, 34, 16, 22, 8]
        return <circle key={x} cx={x} cy={ys[i]} r="2.5" fill="var(--accent)" />
      })}
      <path d="M4,52 L34,42 L64,46 L94,30 L124,34 L154,16 L184,22 L216,8 L216,68 L4,68 Z" fill="var(--accent)" opacity="0.06" />
    </svg>
  )
}

function ThresholdVisual() {
  return (
    <div className="mt-1 flex flex-col gap-2">
      <div className="flex items-center justify-between text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
        <span>Xarajatlar limiti</span>
        <span className="font-mono" style={{ color: 'var(--danger)' }}>
          +21.7%
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'var(--bg-elevated)' }}>
        <div className="h-full rounded-full" style={{ width: '78%', backgroundColor: 'var(--danger)', opacity: 0.85 }} />
        <div className="absolute top-0 h-full w-[2px]" style={{ left: '60%', backgroundColor: 'var(--text-tertiary)' }} />
      </div>
    </div>
  )
}

function ChecklistVisual() {
  const items = ['Marketing byudjetini qisqartirish', 'Xarajatlarni qayta ko‘rib chiqish']
  return (
    <div className="mt-1 flex flex-col gap-2">
      {items.map((it) => (
        <div key={it} className="flex items-center gap-2 text-[11.5px]" style={{ color: 'var(--text-secondary)' }}>
          <span
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
          {it}
        </div>
      ))}
    </div>
  )
}

function UploadVisual() {
  return (
    <div
      className="mt-1 flex items-center gap-3 rounded-lg border border-dashed px-3 py-2.5"
      style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-elevated)' }}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 9l5-5 5 5M12 4v12" />
        </svg>
      </span>
      <div className="min-w-0">
        <p className="truncate text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>
          moliya_2026.xlsx
        </p>
        <p className="text-[10.5px]" style={{ color: 'var(--text-tertiary)' }}>
          Yuklanmoqda\u2026
        </p>
      </div>
    </div>
  )
}

const features = [
  {
    icon: <path d="M3 17l6-6 4 4 8-8M21 7v6h-6" />,
    title: 'Moliyani tahlil qiladi',
    desc: 'AI biznesingiz moliyasini tahlil qilib, asosiy ko‘rsatkichlarni ko‘rsatadi.',
    visual: <MiniTrendVisual />,
    span: 'lg:col-span-2',
  },
  {
    icon: <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />,
    title: 'Muammolarni aniqlaydi',
    desc: 'Xarajatlar, daromad va foyda bo‘yicha muammolarni erta aniqlaydi.',
    visual: <ThresholdVisual />,
    span: 'lg:col-span-1',
  },
  {
    icon: <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />,
    title: 'Tavsiyalar beradi',
    desc: 'O‘sish va samaradorlik uchun amaliy tavsiyalar beradi.',
    visual: <ChecklistVisual />,
    span: 'lg:col-span-1',
  },
  {
    icon: <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 9l5-5 5 5M12 4v12" />,
    title: 'Ma’lumotlarni oson yuklang',
    desc: 'Excel yoki CSV fayllarni yuklang, biz qolganini qilamiz.',
    visual: <UploadVisual />,
    span: 'lg:col-span-4',
  },
]

function FeatureCard({ f, i }: { f: (typeof features)[number]; i: number }) {
  const { ref, inView } = useReveal<HTMLDivElement>()
  const isWide = f.span === 'lg:col-span-4'

  return (
    <div
      ref={ref}
      className={`reveal group rounded-xl border p-6 transition-colors duration-300 ${f.span} ${inView ? 'in-view' : ''}`}
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--surface)',
        transitionDelay: `${i * 90}ms`,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div className={isWide ? 'flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between' : 'flex flex-col'}>
        <div className={isWide ? 'sm:max-w-xs' : ''}>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {f.icon}
            </svg>
          </div>
          <h3 className="font-display mt-4 text-[15.5px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            {f.title}
          </h3>
          <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {f.desc}
          </p>
        </div>
        <div className={isWide ? 'w-full sm:w-72' : 'mt-5'}>{f.visual}</div>
      </div>
    </div>
  )
}

export default function Features() {
  return (
    <section id="xususiyatlar" className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
      <div
        className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12.5px]"
        style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
        Xususiyatlar
      </div>
      <h2 className="font-display mt-4 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
        Hisobfy sizning biznesingiz uchun
      </h2>
      <div className="mt-12 grid gap-4 lg:grid-cols-4">
        {features.map((f, i) => (
          <FeatureCard key={f.title} f={f} i={i} />
        ))}
      </div>
    </section>
  )
}
