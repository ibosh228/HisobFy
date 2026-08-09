import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

export default function Register() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="flex items-center justify-between px-6 py-5 lg:px-8">
        <Link to="/" className="flex flex-col leading-tight">
          <span className="font-display text-lg font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Hisobfy
          </span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div
          className="w-full max-w-sm transition-all duration-500"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)' }}
        >
          <div className="rounded-2xl border p-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-md)' }}>
            <h1 className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Hisob yaratish
            </h1>

            <form className="mt-7 flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
              <label className="flex flex-col gap-1.5 text-sm">
                <span style={{ color: 'var(--text-secondary)' }}>Ism</span>
                <input
                  type="text"
                  className="rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors duration-200 focus:border-[var(--accent)]"
                  style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span style={{ color: 'var(--text-secondary)' }}>Email</span>
                <input
                  type="email"
                  className="rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors duration-200 focus:border-[var(--accent)]"
                  style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span style={{ color: 'var(--text-secondary)' }}>Parol</span>
                <input
                  type="password"
                  className="rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors duration-200 focus:border-[var(--accent)]"
                  style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                />
              </label>

              <button
                type="submit"
                className="mt-2 w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                Ro‘yxatdan o‘tish
              </button>
            </form>

            <p className="mt-6 text-center text-[13.5px]" style={{ color: 'var(--text-secondary)' }}>
              Hisobingiz bormi?{' '}
              <Link to="/login" className="font-medium" style={{ color: 'var(--accent)' }}>
                Kirish
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
