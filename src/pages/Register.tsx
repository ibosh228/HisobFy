import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import { supabase } from '../lib/supabaseClient'

export default function Register() {
  const [mounted, setMounted] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })

    setLoading(false)

    if (signUpError) {
      setError(
        signUpError.message.includes('already registered')
          ? 'Bu email allaqachon ro‘yxatdan o‘tgan.'
          : 'Ro‘yxatdan o‘tishda xatolik yuz berdi. Qaytadan urinib ko‘ring.'
      )
      return
    }

    if (data.session) {
      navigate('/dashboard')
      return
    }

    setNotice('Emailingizga tasdiqlash havolasi yuborildi. Iltimos, pochtangizni tekshiring va havolani bosing.')
  }

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

            {error && (
              <div
                className="mt-5 rounded-lg border px-3.5 py-2.5 text-[13px]"
                style={{ borderColor: 'var(--danger)', color: 'var(--danger)', backgroundColor: 'color-mix(in srgb, var(--danger) 10%, transparent)' }}
              >
                {error}
              </div>
            )}
            {notice && (
              <div
                className="mt-5 rounded-lg border px-3.5 py-2.5 text-[13px]"
                style={{ borderColor: 'var(--accent-border)', color: 'var(--accent)', backgroundColor: 'var(--accent-soft)' }}
              >
                {notice}
              </div>
            )}

            {!notice && (
              <form className="mt-7 flex flex-col gap-4" onSubmit={handleSubmit}>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Ism</span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors duration-200 focus:border-[var(--accent)]"
                    style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Email</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors duration-200 focus:border-[var(--accent)]"
                    style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Parol</span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors duration-200 focus:border-[var(--accent)]"
                    style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  {loading ? 'Yaratilmoqda…' : 'Ro‘yxatdan o‘tish'}
                </button>
              </form>
            )}

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
