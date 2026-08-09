import { useEffect, useState } from 'react'
import DashboardPreview from './DashboardPreview'

const points = ['Karta kerak emas', '14 kun bepul', 'Istalgan vaqtda bekor qilish mumkin']

export default function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: 'var(--bg)' }}>
      {/* faint grid texture, signature of the hero only */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 30% 20%, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 30% 20%, black 20%, transparent 75%)',
        }}
      />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-10 lg:px-8 lg:py-28">
        <div>
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] transition-all duration-700"
            style={{
              borderColor: 'var(--border-strong)',
              color: 'var(--text-secondary)',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(10px)',
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
            AI moliyaviy tahlil platformasi
          </div>

          <h1
            className="font-display mt-6 text-[2.6rem] font-extrabold leading-[1.08] tracking-tight sm:text-6xl transition-all duration-700"
            style={{
              color: 'var(--text-primary)',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(14px)',
              transitionDelay: '90ms',
            }}
          >
            Moliyangizni <span style={{ color: 'var(--accent)' }}>AI</span> bilan tushuning
          </h1>

          <p
            className="mt-6 max-w-lg text-base leading-relaxed sm:text-lg transition-all duration-700"
            style={{
              color: 'var(--text-secondary)',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(14px)',
              transitionDelay: '170ms',
            }}
          >
            Hisobfy sun’iy intellekt yordamida biznesingiz moliyasini tahlil qiladi, muammolarni aniqlaydi va o‘sish uchun amaliy tavsiyalar beradi.
          </p>

          <div
            className="mt-8 flex flex-col gap-3 sm:flex-row transition-all duration-700"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(14px)',
              transitionDelay: '250ms',
            }}
          >
            <a
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-[15px] font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Bepul boshlash →
            </a>
            <a
              href="#qanday-ishlaydi"
              className="inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 text-[15px] font-medium transition-all duration-200"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
            >
              Qanday ishlashini ko‘rish
            </a>
          </div>

          <div
            className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6 transition-all duration-700"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(14px)',
              transitionDelay: '330ms',
            }}
          >
            {points.map((p) => (
              <div key={p} className="flex items-center gap-2 text-[13.5px]" style={{ color: 'var(--text-secondary)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.4">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {p}
              </div>
            ))}
          </div>
        </div>

        <div
          className="transition-all duration-700"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transitionDelay: '200ms',
          }}
        >
          <DashboardPreview />
        </div>
      </div>
    </section>
  )
}
