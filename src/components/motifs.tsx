import type { ReactNode } from 'react'

export function Rule({ className = '' }: { className?: string }) {
  return (
    <div className={`relative h-px bg-charcoal/20 dark:bg-bone/20 ${className}`}>
      <span className="absolute -top-[2px] right-0 size-[5px] bg-gold" />
    </div>
  )
}

export function SectionNumber({ n, label }: { n: string; label: string }) {
  return (
    <span className="font-mono text-xs font-medium uppercase tracking-[0.25em] text-charcoal/50 dark:text-bone/50">
      {n} / {label}
    </span>
  )
}

export function JPLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      aria-hidden
      className={`select-none font-display text-[11px] tracking-[0.4em] text-charcoal/35 dark:text-bone/35 [writing-mode:vertical-rl] ${className}`}
    >
      {children}
    </span>
  )
}

function Mark({ pos }: { pos: string }) {
  return (
    <span aria-hidden className={`absolute font-mono text-xs text-charcoal/25 dark:text-bone/25 ${pos}`}>
      +
    </span>
  )
}

export function RegMarks() {
  return (
    <>
      <Mark pos="left-4 top-4" />
      <Mark pos="right-4 top-4" />
      <Mark pos="bottom-4 left-4" />
      <Mark pos="bottom-4 right-4" />
    </>
  )
}

export function MonoTag({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-charcoal/60 dark:text-bone/60">
      {children}
    </span>
  )
}
