import { useEffect, useState } from 'react'
import ThemeToggle from '../../components/ThemeToggle'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabaseClient'

const sections = ['Profil', 'Biznes', 'Ko‘rinish', 'Bildirishnomalar']

export default function Settings() {
  const [active, setActive] = useState(sections[0])
  const { user, business } = useAuth()
  const { showToast } = useToast()

  const [name, setName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingBusiness, setSavingBusiness] = useState(false)

  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifyWeekly, setNotifyWeekly] = useState(true)
  const [notifyAi, setNotifyAi] = useState(true)

  useEffect(() => {
    setName((user?.user_metadata?.name as string) ?? '')
  }, [user])

  useEffect(() => {
    setBusinessName(business?.name ?? '')
  }, [business])

  useEffect(() => {
    if (!user) return
    const raw = localStorage.getItem(`hisobfy-notifications-${user.id}`)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        setNotifyEmail(parsed.email ?? true)
        setNotifyWeekly(parsed.weekly ?? true)
        setNotifyAi(parsed.ai ?? true)
      } catch {
        /* ignore */
      }
    }
  }, [user])

  const saveProfile = async () => {
    setSavingProfile(true)
    const { error } = await supabase.auth.updateUser({ data: { name } })
    setSavingProfile(false)
    showToast(error ? 'Xatolik yuz berdi' : 'Saqlandi', error ? 'error' : 'success')
  }

  const saveBusiness = async () => {
    if (!business) return
    setSavingBusiness(true)
    const { error } = await supabase.from('businesses').update({ name: businessName }).eq('id', business.id)
    setSavingBusiness(false)
    showToast(error ? 'Xatolik yuz berdi' : 'Saqlandi', error ? 'error' : 'success')
  }

  const saveNotifications = () => {
    if (!user) return
    localStorage.setItem(
      `hisobfy-notifications-${user.id}`,
      JSON.stringify({ email: notifyEmail, weekly: notifyWeekly, ai: notifyAi })
    )
    showToast('Saqlandi')
  }

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
            <label className="flex flex-col gap-1.5 text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Ism</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg border px-3.5 py-2.5 text-sm outline-none"
                style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Email</span>
              <input
                value={user?.email ?? ''}
                disabled
                className="rounded-lg border px-3.5 py-2.5 text-sm outline-none opacity-60"
                style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
              />
            </label>
            <button
              onClick={saveProfile}
              disabled={savingProfile}
              className="mt-2 w-fit rounded-lg px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {savingProfile ? 'Saqlanmoqda…' : 'Saqlash'}
            </button>
          </div>
        )}
        {active === 'Biznes' && (
          <div className="flex max-w-sm flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Biznes nomi</span>
              <input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="rounded-lg border px-3.5 py-2.5 text-sm outline-none"
                style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
              />
            </label>
            <button
              onClick={saveBusiness}
              disabled={savingBusiness}
              className="mt-2 w-fit rounded-lg px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {savingBusiness ? 'Saqlanmoqda…' : 'Saqlash'}
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
            {[
              { label: 'Email orqali xabar berish', value: notifyEmail, set: setNotifyEmail },
              { label: 'Haftalik hisobot', value: notifyWeekly, set: setNotifyWeekly },
              { label: 'AI tavsiyalar', value: notifyAi, set: setNotifyAi },
            ].map((n) => (
              <label key={n.label} className="flex items-center justify-between text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                {n.label}
                <input
                  type="checkbox"
                  checked={n.value}
                  onChange={(e) => n.set(e.target.checked)}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
              </label>
            ))}
            <button
              onClick={saveNotifications}
              className="mt-2 w-fit rounded-lg px-4 py-2 text-[13px] font-semibold text-white"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Saqlash
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
