import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Yorug’ rejimga o‘tish' : 'Qorong‘i rejimga o‘tish'}
      className="relative flex h-8 w-14 items-center rounded-full border transition-colors duration-300 cursor-pointer"
      style={{
        borderColor: 'var(--border-strong)',
        backgroundColor: 'var(--surface)',
      }}
    >
      <span
        className="absolute left-0.5 flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-300 ease-out"
        style={{
          transform: isDark ? 'translateX(24px)' : 'translateX(0px)',
          backgroundColor: 'var(--accent)',
        }}
      >
        {isDark ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        )}
      </span>
    </button>
  )
}
