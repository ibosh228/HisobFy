import { Link } from 'react-router-dom'

const links = [
  { label: 'Xususiyatlar', href: '#xususiyatlar' },
  { label: 'Narxlar', href: '#narxlar' },
  { label: 'Qanday ishlaydi', href: '#qanday-ishlaydi' },
  { label: 'Aloqa', href: '#aloqa' },
]

export default function Footer() {
  return (
    <footer id="aloqa" className="border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 py-12 sm:flex-row sm:items-center lg:px-8">
        <div>
          <Link to="/" className="font-display text-lg font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Hisobfy
          </Link>
          <p className="mt-1 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
            AI Finance Analyst
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-[13.5px]" style={{ color: 'var(--text-secondary)' }}>
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
