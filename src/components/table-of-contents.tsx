import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from './icons'

type Heading = { id: string; text: string; level: number }

function extractHeadings(markdown: string): Heading[] {
  const lines = markdown.split('\n')
  const headings: Heading[] = []
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
      headings.push({ id, text, level })
    }
  }
  return headings
}

export function TableOfContents({ content }: { content: string }) {
  const headings = useMemo(() => extractHeadings(content), [content])
  const [active, setActive] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(true)

  // ponytail: single scroll listener for active heading
  useEffect(() => {
    const onScroll = () => {
      let current: string | null = null
      for (const h of headings) {
        const el = document.getElementById(h.id)
        if (el && el.getBoundingClientRect().top < 200) current = h.id
      }
      setActive(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [headings])

  if (headings.length < 3) return null

  // ponytail: portal to body to escape any parent transforms breaking fixed positioning
  return createPortal(
    <nav className="fixed right-4 top-24 z-50 hidden w-56 lg:block">
      <div className="rounded-lg border border-charcoal/10 bg-bone/95 p-4 shadow-lg backdrop-blur-sm dark:border-bone/10 dark:bg-charcoal/95">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-between gap-2 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/70 dark:text-bone/70 hover:text-gold transition-colors"
        >
          <span>On this page</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}
          />
        </button>

        {!collapsed && (
          <ul className="mt-3 space-y-2.5 overflow-y-auto max-h-[55vh] pr-2">
            {headings.map((h) => (
              <li key={h.id} style={{ paddingLeft: h.level === 3 ? '0.75rem' : 0 }}>
                <a
                  href={`#${h.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className={`block text-sm leading-relaxed transition-colors ${
                    active === h.id
                      ? 'text-gold font-medium'
                      : 'text-charcoal/60 hover:text-charcoal dark:text-bone/60 dark:hover:text-bone'
                  }`}
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>,
    document.body
  )
}
