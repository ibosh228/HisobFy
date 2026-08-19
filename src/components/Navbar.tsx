import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '../context/AuthContext'

type NavItem = {
  label: string
  href: string
  kind?: 'anchor' | 'link'
  emphasize?: boolean
  prominent?: boolean
}

function useNavItems(): NavItem[] {
  const { user } = useAuth()
  return [
    { label: 'Xususiyatlar', href: '#xususiyatlar', kind: 'anchor' },
    { label: 'Narxlar', href: '#narxlar', kind: 'anchor' },
    { label: 'AI', href: user ? '/dashboard/ai' : '/login', kind: 'link', emphasize: true },
    { label: 'Qanday ishlaydi', href: '#qanday-ishlaydi', kind: 'anchor' },
    { label: 'Kabinet', href: user ? '/dashboard' : '/login', kind: 'link', prominent: true },
    { label: 'Aloqa', href: '#aloqa', kind: 'anchor' },
  ]
}

function NavLinkItem({ item }: { item: NavItem }) {
  if (item.emphasize) {
    return (
      <Link
        to={item.href}
        className="mx-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors duration-200"
        style={{ borderColor: 'var(--accent-border)', color: 'var(--accent)', backgroundColor: 'var(--accent-soft)' }}
      >
        {item.label}
      </Link>
    )
  }

  if (item.prominent) {
    return (
      <Link
        to={item.href}
        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200"
        style={{ color: 'var(--text-primary)' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
        {item.label}
      </Link>
    )
  }

  return (
    <a
      href={item.href}
      className="rounded-md px-3 py-1.5 text-sm transition-colors duration-200"
      style={{ color: 'var(--text-secondary)' }}
      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
    >
      {item.label}
    </a>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const navItems = useNavItems()
  const { user, signOut } = useAuth()

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-500 ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
      style={{
        borderColor: scrolled ? 'var(--border)' : 'transparent',
        backgroundColor: scrolled ? 'color-mix(in srgb, var(--bg) 88%, transparent)' : 'var(--bg)',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        transitionProperty: 'background-color, border-color, opacity, transform',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 lg:px-8">
        <Link to="/" className="flex flex-col leading-tight">
          <span className="font-display text-lg font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Hisobfy
          </span>
          <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
            AI Finance Analyst
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <NavLinkItem key={item.href} item={item} />
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <button type="button" className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z" />
            </svg>
            UZ
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          <ThemeToggle />
          {user ? (
            <button
              type="button"
              onClick={() => signOut()}
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: 'var(--text-primary)' }}
            >
              Chiqish
            </button>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium transition-colors duration-200" style={{ color: 'var(--text-primary)' }}>
                Kirish
              </Link>
              <Link
                to="/register"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                Bepul boshlash
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="flex items-center justify-center lg:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Menyu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2">
            {mobileOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </div>

      <div
        className="overflow-hidden border-t lg:hidden transition-all duration-300"
        style={{ maxHeight: mobileOpen ? '520px' : '0px', borderColor: mobileOpen ? 'var(--border)' : 'transparent' }}
      >
        <div className="flex flex-col gap-1 px-6 py-4">
          {navItems.map((item) =>
            item.kind === 'link' ? (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-md px-2 py-2.5 text-sm font-medium"
                style={
                  item.emphasize
                    ? { color: 'var(--accent)', backgroundColor: 'var(--accent-soft)' }
                    : { color: 'var(--text-primary)' }
                }
              >
                {!item.emphasize && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                )}
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm"
                style={item.emphasize ? { color: 'var(--accent)', backgroundColor: 'var(--accent-soft)' } : { color: 'var(--text-secondary)' }}
              >
                {item.label}
              </a>
            )
          )}
          <div className="mt-3 flex items-center justify-between border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            {user ? (
              <button
                type="button"
                onClick={() => {
                  signOut()
                  setMobileOpen(false)
                }}
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Chiqish
              </button>
            ) : (
              <Link to="/login" className="text-sm font-medium" style={{ color: 'var(--text-primary)' }} onClick={() => setMobileOpen(false)}>
                Kirish
              </Link>
            )}
            <ThemeToggle />
          </div>
          {!user && (
            <Link
              to="/register"
              onClick={() => setMobileOpen(false)}
              className="mt-3 w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-white"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Bepul boshlash
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
