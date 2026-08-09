import { useReveal } from '../hooks/useReveal'

const steps = [
  {
    n: '01',
    title: 'Ma’lumotlarni yuklang',
    desc: 'Excel yoki CSV faylingizni yuklang.',
    icon: <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 9l5-5 5 5M12 4v12" />,
  },
  {
    n: '02',
    title: 'Hisobfy tahlil qiladi',
    desc: 'Moliyaviy ma’lumotlaringiz asosida asosiy o‘zgarishlarni aniqlaydi.',
    icon: <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m14.5-6.5l-2 2M8.5 15.5l-2 2m11-2l-2-2M8.5 8.5l-2-2M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />,
  },
  {
    n: '03',
    title: 'Natijani tushuning',
    desc: 'Muammolar va muhim ko‘rsatkichlarni sodda ko‘rinishda ko‘ring.',
    icon: <path d="M3 17l6-6 4 4 8-8M21 7v6h-6M4 21h16" />,
  },
]

function Step({ s, i }: { s: (typeof steps)[number]; i: number }) {
  const { ref, inView } = useReveal<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={`reveal relative flex flex-col rounded-xl border p-6 ${inView ? 'in-view' : ''}`}
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', transitionDelay: `${i * 110}ms` }}
    >
      <div className="flex items-center justify-between">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {s.icon}
          </svg>
        </span>
        <span className="font-mono text-2xl font-semibold" style={{ color: 'var(--border-strong)' }}>
          {s.n}
        </span>
      </div>

      <h3 className="font-display mt-5 text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        {s.title}
      </h3>
      <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {s.desc}
      </p>

      {i < steps.length - 1 && (
        <span
          className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border sm:flex"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border-strong)', color: 'var(--text-tertiary)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      )}
    </div>
  )
}

export default function HowItWorks() {
  return (
    <section id="qanday-ishlaydi" className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
      <div
        className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12.5px]"
        style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
        Jarayon
      </div>
      <h2 className="font-display mt-4 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
        Qanday ishlaydi?
      </h2>
      <div className="relative mt-12 grid gap-5 sm:grid-cols-3">
        {steps.map((s, i) => (
          <Step key={s.n} s={s} i={i} />
        ))}
      </div>
    </section>
  )
}
