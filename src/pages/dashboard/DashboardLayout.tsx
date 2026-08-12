import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import ThemeToggle from '../../components/ThemeToggle'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Umumiy ko‘rinish', icon: <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />, end: true },
  { to: '/dashboard/analytics', label: 'Analitika', icon: <path d="M3 3v18h18M7 15l4-4 3 3 5-6" /> },
  { to: '/dashboard/transactions', label: 'Tranzaksiyalar', icon: <path d="M3 6h18M3 12h18M3 18h18" /> },
  { to: '/dashboard/ai', label: 'AI tahlil', icon: <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m14.5-6.5l-2 2M8.5 15.5l-2 2m11-2l-2-2M8.5 8.5l-2-2M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" /> },
  { to: '/dashboard/data', label: 'Ma’lumotlar', icon: <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 9l5-5 5 5M12 4v12" /> },
  { to: '/dashboard/settings', label: 'Sozlamalar', icon: <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /> },
]

const titles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Umumiy ko‘rinish', subtitle: 'Biznesingizning moliyaviy holati' },
  '/dashboard/analytics': { title: 'Analitika', subtitle: 'Biznesingiz moliyasini batafsil tahlil qiling' },
  '/dashboard/transactions': { title: 'Tranzaksiyalar', subtitle: 'Barcha moliyaviy operatsiyalar tarixi' },
  '/dashboard/ai': { title: 'AI tahlil', subtitle: 'Biznesingiz haqida savol bering' },
  '/dashboard/data': { title: 'Ma’lumotlar', subtitle: 'Biznesingiz moliyaviy ma’lumotlarini boshqaring' },
  '/dashboard/settings': { title: 'Sozlamalar', subtitle: 'Hisobingiz va biznes ma’lumotlarini boshqaring' },
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, signOut } = useAuth()
  const initials = (user?.user_metadata?.name as string | undefined)
    ?.trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'DB'

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="font-display text-[17px] font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Hisobfy
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] transition-colors duration-150 ${isActive ? 'font-medium' : ''}`
            }
            style={({ isActive }) => ({
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--accent-soft)' : 'transparent',
            })}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {item.icon}
            </svg>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t px-4 py-4" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold"
            style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
              Demo Business
            </p>
            <p className="truncate text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
              {user?.email ?? 'demo@example.com'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            signOut()
            onNavigate?.()
          }}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] transition-colors duration-150"
          style={{ color: 'var(--text-secondary)' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Chiqish
        </button>
      </div>
    </div>
  )
}

export default function DashboardLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()
  const meta = titles[location.pathname] ?? titles['/dashboard']
  const { user } = useAuth()
  const initials = (user?.user_metadata?.name as string | undefined)
    ?.trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'DB'

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden w-60 shrink-0 border-r lg:block"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${drawerOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!drawerOpen}
      >
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', opacity: drawerOpen ? 1 : 0 }}
          onClick={() => setDrawerOpen(false)}
        />
        <div
          className="absolute left-0 top-0 h-full w-64 border-r transition-transform duration-300 ease-out"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--bg-elevated)',
            transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          }}
        >
          <SidebarContent onNavigate={() => setDrawerOpen(false)} />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b px-4 py-3.5 sm:px-6"
          style={{ borderColor: 'var(--border)', backgroundColor: 'color-mix(in srgb, var(--bg) 92%, transparent)', backdropFilter: 'blur(8px)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="flex items-center justify-center lg:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Menyu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="font-display truncate text-[15px] font-semibold sm:text-[17px]" style={{ color: 'var(--text-primary)' }}>
                {meta.title}
              </h1>
              <p className="truncate text-[11.5px] sm:text-[12.5px]" style={{ color: 'var(--text-tertiary)' }}>
                {meta.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span
              className="hidden items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12.5px] sm:flex"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              Avgust 2026
            </span>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg border"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
              aria-label="Bildirishnomalar"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9zM13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <ThemeToggle />
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold"
              style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              {initials}
            </span>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
