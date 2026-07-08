import { useEffect, useRef, useState } from 'react'

const LABEL = '[ REDACTED ]'
const GLYPHS = '@#%&$?!*+=<>/\\|01ABCDEFGHJKLMNPQRSTUVWXYZ'

// scramble the inner chars but keep the brackets + spaces, so it always reads as a redaction field
function scramble(): string {
  let out = ''
  for (const ch of LABEL) {
    out += ch === '[' || ch === ']' || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]
  }
  return out
}

// Resting state = random chars constantly changing. Hover/focus settles to "[ REDACTED ]".
export function Redacted() {
  // deterministic first paint so prerender/hydration match; the scramble starts on the client
  const [text, setText] = useState(LABEL)
  const hover = useRef(false)

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    let last = 0
    const tick = (t: number) => {
      if (t - last > 55) {
        last = t
        setText(hover.current ? LABEL : scramble())
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <span
      aria-label="redacted"
      title="redacted"
      tabIndex={0}
      onMouseEnter={() => {
        hover.current = true
        setText(LABEL)
      }}
      onMouseLeave={() => {
        hover.current = false
      }}
      onFocus={() => {
        hover.current = true
        setText(LABEL)
      }}
      onBlur={() => {
        hover.current = false
      }}
      className="cursor-help select-none whitespace-pre rounded-sm bg-charcoal/10 px-1 font-mono text-[0.95em] text-paper-deep dark:bg-bone/10 dark:text-paper"
    >
      {text}
    </span>
  )
}
