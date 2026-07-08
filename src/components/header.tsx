import { useEffect, useState } from 'react'
import { NavLink } from 'react-router'
import Magnetic from './react-bits/Magnetic'

const links = [
  { to: '/blog', label: 'Blog', jp: 'ブログ' },
  { to: '/portfolio', label: 'Portfolio', jp: '作品' },
  { to: '/research', label: 'Research', jp: '研究' },
  { to: '/stack', label: 'Stack', jp: '技' },
]

function ThemeToggle() {
  const [dark, setDark] = useState(false)
  useEffect(() => setDark(document.documentElement.classList.contains('dark')), [])

  return (
    <Magnetic range={40}>
      <button
        aria-label="Toggle theme"
        className="cursor-pointer font-display text-sm font-semibold text-charcoal/60 transition-colors hover:text-gold dark:text-bone/60"
        onClick={() => {
          const isDark = document.documentElement.classList.toggle('dark')
          localStorage.theme = isDark ? 'dark' : 'light'
          setDark(isDark)
        }}
      >
        {dark ? '「日」' : '「月」'}
      </button>
    </Magnetic>
  )
}

export function Header() {
  return (
    <header className="fixed left-1/2 top-5 z-50 -translate-x-1/2">
      <nav className="flex items-center gap-6 rounded-full border border-charcoal/10 bg-bone/75 px-6 py-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-lg dark:border-bone/10 dark:bg-charcoal/75 dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
        <Magnetic range={40}>
          <NavLink
            to="/"
            aria-label="Home"
            className="font-display text-sm font-black uppercase tracking-wider text-charcoal transition-colors hover:text-gold dark:text-bone"
          >
            Home
          </NavLink>
        </Magnetic>
        <span aria-hidden className="h-4 w-px bg-charcoal/15 dark:bg-bone/15" />
        {links.map((l) => (
          <Magnetic key={l.to} range={40}>
            <NavLink
              to={l.to}
              className={({ isActive }) =>
                `link-draw font-display text-sm font-semibold uppercase tracking-wider transition-colors ${
                  isActive ? 'text-gold' : 'text-charcoal/70 hover:text-charcoal dark:text-bone/70 dark:hover:text-bone'
                }`
              }
            >
              {l.label}
            </NavLink>
          </Magnetic>
        ))}
        <ThemeToggle />
      </nav>
    </header>
  )
}
