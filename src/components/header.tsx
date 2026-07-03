import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/blog', label: 'Blog', jp: 'ブログ' },
  { to: '/portfolio', label: 'Portfolio', jp: '作品' },
  { to: '/research', label: 'Research', jp: '研究' },
]

function ThemeToggle() {
  // ponytail: state only for the icon; source of truth is the <html> class set pre-paint
  const [dark, setDark] = useState(false)
  useEffect(() => setDark(document.documentElement.classList.contains('dark')), [])
  return (
    <button
      aria-label="Toggle theme"
      className="cursor-pointer font-mono text-xs text-charcoal/60 transition-colors hover:text-gold dark:text-bone/60"
      onClick={() => {
        const isDark = document.documentElement.classList.toggle('dark')
        localStorage.theme = isDark ? 'dark' : 'light'
        setDark(isDark)
      }}
    >
      {dark ? '☾' : '☀'}
    </button>
  )
}

export function Header() {
  return (
    <header className="fixed left-1/2 top-5 z-50 -translate-x-1/2">
      <nav className="flex items-center gap-6 rounded-full border border-charcoal/10 bg-bone/70 px-6 py-2.5 shadow-sm backdrop-blur-md dark:border-bone/10 dark:bg-charcoal/70">
        <NavLink to="/" className="font-display text-sm font-bold tracking-wide">
          N<span className="text-gold">E</span>
        </NavLink>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `link-draw font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${
                isActive ? 'text-gold' : 'text-charcoal/70 hover:text-charcoal dark:text-bone/70 dark:hover:text-bone'
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
        <ThemeToggle />
      </nav>
    </header>
  )
}
