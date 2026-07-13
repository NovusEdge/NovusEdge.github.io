import { useEffect, useState } from 'react'
import { RegMarks } from './motifs'

const glyphs = ['囁', '秘', '隠', '?', '█']

export function RedactedCard() {
  const [hover, setHover] = useState(false)
  const [glyph, setGlyph] = useState(glyphs[0])

  useEffect(() => {
    if (!hover) return
    const id = setInterval(() => {
      setGlyph(glyphs[Math.floor(Math.random() * glyphs.length)])
    }, 100)
    return () => clearInterval(id)
  }, [hover])

  return (
    <div
      data-card
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative flex h-72 flex-col justify-between overflow-hidden rounded border border-charcoal/10 bg-bone-tint/20 p-6 dark:border-bone/10 dark:bg-charcoal-tint/20"
    >
      <RegMarks />
      <div
        className="absolute inset-0 flex items-center justify-center opacity-[0.07] dark:opacity-[0.05]"
        style={{ background: 'linear-gradient(135deg, var(--gold) 0%, transparent 70%)' }}
      >
        <span className={`select-none font-display text-[6rem] font-black ${hover ? 'animate-pulse' : ''}`}>
          {glyph}
        </span>
      </div>

      <div className="relative">
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.2em] text-charcoal/50 dark:text-bone/50">
          <span className="rounded border border-violet-500/50 px-1.5 py-0.5 text-violet-500">stealth</span>
          <span>2026</span>
        </div>
        <h3 className="mt-3 font-display text-2xl font-black text-charcoal dark:text-bone">
          {hover ? 'whisperless' : '██████████'}
        </h3>
        <p className="mt-2 text-base leading-relaxed text-charcoal/70 dark:text-bone/70">
          {hover ? 'neural interfaces for silent input. think without speaking.' : '████████ ████████ ██████'}
        </p>
      </div>

      <div className="relative">
        <span className="font-mono text-xs uppercase tracking-wider text-charcoal/40 dark:text-bone/40">
          {hover ? 'exciting things brewing' : 'stealth project - hover for hint'}
        </span>
      </div>
    </div>
  )
}
