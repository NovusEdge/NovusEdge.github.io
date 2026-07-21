import { useState, type ReactNode } from 'react'

// ponytail: hover/click to reveal blurred spoiler content
export function Spoiler({ label, children }: { label?: string; children: ReactNode }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="my-4">
      <div className="mb-2 text-sm font-mono text-charcoal/60 dark:text-bone/60 select-none">
        {label ? `SPOILER: ${label}` : 'SPOILER'}
      </div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setRevealed(true)}
        onKeyDown={(e) => e.key === 'Enter' && setRevealed(true)}
        onMouseEnter={() => setRevealed(true)}
        onMouseLeave={() => setRevealed(false)}
        onFocus={() => setRevealed(true)}
        onBlur={() => setRevealed(false)}
        className={`relative cursor-pointer rounded-md border border-charcoal/20 dark:border-bone/20 px-4 py-3 transition-all duration-200 whitespace-pre-line [&_p]:my-1 [&>:first-child]:mt-0 [&>:last-child]:mb-0 ${
          revealed ? '' : 'select-none blur-sm'
        }`}
        aria-label={revealed ? 'Spoiler revealed' : 'Hover or click to reveal spoiler'}
      >
        {children}
      </div>
    </div>
  )
}
