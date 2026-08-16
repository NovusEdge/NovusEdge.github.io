import type { ReactNode } from 'react'

/* Shared marks for project bodies. Each one sits inside a `prose` container,
   so every wrapper carries `not-prose` and states its own type scale. */

export function Term({ children }: { children: string }) {
  return (
    <pre className="not-prose my-8 overflow-x-auto rounded border border-charcoal/10 bg-bone-tint/30 p-5 font-mono text-[10px] leading-relaxed text-charcoal/75 dark:border-bone/10 dark:bg-charcoal-tint/40 dark:text-bone/75 sm:text-xs">
      {children}
    </pre>
  )
}

export type Figure = { value: string; label: string; note?: string }

/* Lifts the numbers an argument rests on out of the paragraph that argues it.
   Two to four entries; more than four and the row stops reading as a set. */
export function Figures({ items }: { items: Figure[] }) {
  return (
    <dl className="not-prose my-8 grid grid-cols-2 gap-px overflow-hidden rounded border border-charcoal/10 bg-charcoal/10 dark:border-bone/10 dark:bg-bone/10 sm:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]">
      {items.map((f) => (
        <div key={f.label} className="bg-bone px-4 py-5 dark:bg-charcoal">
          <dd className="font-display text-3xl font-black tabular-nums leading-none text-charcoal dark:text-bone">
            {f.value}
          </dd>
          <dt className="mt-2.5 font-mono text-[10px] uppercase leading-snug tracking-[0.18em] text-charcoal/50 dark:text-bone/50">
            {f.label}
          </dt>
          {f.note && (
            <p className="mt-1.5 text-[13px] leading-snug text-charcoal/45 dark:text-bone/45">{f.note}</p>
          )}
        </div>
      ))}
    </dl>
  )
}

/* For the one sentence a section is built around. Keep it to a sentence or
   two: a long pull quote reads as a second paragraph, not as emphasis. */
export function Pull({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-8 border-l-2 border-gold py-1 pl-5">
      <p className="font-display text-xl font-medium leading-snug text-charcoal dark:text-bone sm:text-2xl">
        {children}
      </p>
    </div>
  )
}
