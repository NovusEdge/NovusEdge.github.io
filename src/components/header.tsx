import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import Magnetic from './react-bits/Magnetic'
import { TNavLink } from './page-transition'

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

function Hamburger({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      aria-label={open ? 'Close menu' : 'Open menu'}
      aria-expanded={open}
      className="flex h-8 w-8 cursor-pointer flex-col items-center justify-center gap-1.5 md:hidden"
      onClick={onClick}
    >
      <span
        className={`h-0.5 w-5 bg-charcoal transition-transform dark:bg-bone ${open ? 'translate-y-2 rotate-45' : ''}`}
      />
      <span
        className={`h-0.5 w-5 bg-charcoal transition-opacity dark:bg-bone ${open ? 'opacity-0' : ''}`}
      />
      <span
        className={`h-0.5 w-5 bg-charcoal transition-transform dark:bg-bone ${open ? '-translate-y-2 -rotate-45' : ''}`}
      />
    </button>
  )
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  // ponytail: close menu on route change
  useEffect(() => setMenuOpen(false), [location.pathname])

  return (
    <header className="fixed left-1/2 top-5 z-50 -translate-x-1/2">
      {/* Desktop nav */}
      <nav className="hidden items-center gap-6 rounded-full border border-charcoal/10 bg-bone/75 px-6 py-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-lg md:flex dark:border-bone/10 dark:bg-charcoal/75 dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
        <Magnetic range={40}>
          <TNavLink
            to="/"
            aria-label="Home"
            className="font-display text-sm font-black uppercase tracking-wider text-charcoal transition-colors hover:text-gold dark:text-bone"
          >
            Home
          </TNavLink>
        </Magnetic>
        <span aria-hidden className="h-4 w-px bg-charcoal/15 dark:bg-bone/15" />
        {links.map((l) => (
          <Magnetic key={l.to} range={40}>
            <TNavLink
              to={l.to}
              className={({ isActive }) =>
                `link-draw font-display text-sm font-semibold uppercase tracking-wider transition-colors ${
                  isActive ? 'text-gold' : 'text-charcoal/70 hover:text-charcoal dark:text-bone/70 dark:hover:text-bone'
                }`
              }
            >
              {l.label}
            </TNavLink>
          </Magnetic>
        ))}
        <ThemeToggle />
      </nav>

      {/* Mobile nav */}
      <div className="md:hidden">
        <div className="flex items-center gap-3 rounded-full border border-charcoal/10 bg-bone/75 px-4 py-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-lg dark:border-bone/10 dark:bg-charcoal/75 dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
          <TNavLink
            to="/"
            className="font-display text-sm font-black uppercase tracking-wider text-charcoal transition-colors hover:text-gold dark:text-bone"
          >
            Home
          </TNavLink>
          <ThemeToggle />
          <Hamburger open={menuOpen} onClick={() => setMenuOpen(!menuOpen)} />
        </div>

        {menuOpen && (
          <nav className="mt-2 flex flex-col gap-1 rounded-2xl border border-charcoal/10 bg-bone/95 p-3 shadow-lg backdrop-blur-lg dark:border-bone/10 dark:bg-charcoal/95">
            {links.map((l) => (
              <TNavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-2 font-display text-sm font-semibold uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'bg-gold/10 text-gold'
                      : 'text-charcoal/70 hover:bg-charcoal/5 dark:text-bone/70 dark:hover:bg-bone/5'
                  }`
                }
              >
                {l.label}
              </TNavLink>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
