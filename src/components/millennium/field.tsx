import { useRef, type CSSProperties } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FIELD, FIELD_MONTHS, FIELD_ROWS, PRIZES } from './field-data'
import './field.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const IDLE = 'Scroll to run the year.'
const DONE = `${FIELD.length} results, February to November 2026. Pick a dot to read it.`

// Rendered fully lit, which is also the reduced-motion state. When `live`, scroll position sets
// how many results are lit, in date order.
export function ResultField({ live }: { live: boolean }) {
  const root = useRef<HTMLElement>(null)
  const read = useRef<HTMLParagraphElement>(null)
  const count = useRef(FIELD.length)

  const show = (i: number | null) => {
    const el = read.current
    if (!el) return
    const r = i === null ? null : FIELD[i]
    el.replaceChildren()
    if (!r) {
      el.textContent = count.current === 0 ? IDLE : count.current === FIELD.length ? DONE : ''
      if (el.textContent) return
      return show(count.current - 1)
    }
    const when = document.createElement('b')
    when.textContent = r.when
    const who = document.createElement('span')
    who.textContent = r.who
    el.append(when, ` ${r.what} `, who)
  }

  useGSAP(
    () => {
      if (!live) return
      const section = root.current!
      const nodes = gsap.utils.toArray<HTMLElement>('.ml-node', section)
      const prizes = gsap.utils.toArray<HTMLElement>('.ml-prizes li', section)
      const set = (n: number) => {
        if (n === count.current) return
        count.current = n
        nodes.forEach((node, i) => node.toggleAttribute('data-on', i < n))
        prizes.forEach((p) => {
          const at = FIELD.findIndex((r) => r.prize === p.dataset.prize)
          if (at >= 0) p.toggleAttribute('data-on', at < n)
        })
        section.style.setProperty('--lit', String(n / FIELD.length))
        show(null)
      }
      // One step of spare scroll at each end, so the empty field and the full one both hold for a moment.
      ScrollTrigger.create({
        trigger: section,
        start: 'top 45%',
        end: 'bottom bottom',
        onUpdate: (self) => set(Math.max(0, Math.min(FIELD.length, Math.round(self.progress * (FIELD.length + 2) - 1)))),
      })
      set(0)
      return () => {
        nodes.forEach((node) => node.setAttribute('data-on', ''))
        prizes.forEach((p) => p.dataset.state !== 'open' && p.setAttribute('data-on', ''))
        section.style.removeProperty('--lit')
        count.current = FIELD.length
        show(null)
      }
    },
    { scope: root, dependencies: [live], revertOnUpdate: true },
  )

  let n = 0
  return (
    <section ref={root} className="ml-field" data-zone="read" aria-label="2026 results made with AI, by month, and the seven Millennium Prize problems">
      <div className="ml-field-stage">
        <p className="ml-field-lede">Every dot is a 2026 result made with AI, in the month it landed. The row on top is the seven Millennium Prize problems.</p>
        <ol className="ml-prizes">
          {PRIZES.map((p) => (
            <li key={p.id} data-prize={p.id} data-state={p.state} data-on={p.state === 'open' ? undefined : ''} title={p.note}>
              <i />
              {p.short ? (
                <>
                  <span data-long>{p.name}</span>
                  <span data-short title={p.name}>
                    {p.short}
                  </span>
                </>
              ) : (
                <span>{p.name}</span>
              )}
              <small>{p.note}</small>
            </li>
          ))}
        </ol>
        <div className="ml-field-plot" style={{ '--rows': FIELD_ROWS } as CSSProperties}>
          {FIELD_MONTHS.map((m) => {
            const mine = FIELD.filter((r) => r.month === m)
            return (
              <div key={m} className="ml-field-col">
                <ol>
                  {mine.map((r) => {
                    const i = n++
                    return (
                      <li key={r.what}>
                        <button
                          type="button"
                          className={`ml-node${r.tone ? ` ml-node--${r.tone}` : ''}${r.both ? ' ml-node--both' : ''}`}
                          data-on=""
                          aria-label={`${r.when}: ${r.what}. ${r.who}.`}
                          onPointerEnter={() => i < count.current && show(i)}
                          onFocus={() => i < count.current && show(i)}
                          onPointerLeave={() => show(null)}
                          onBlur={() => show(null)}
                        >
                          {r.both && (
                            <>
                              <i />
                              <i />
                              <em>OpenAI</em>
                              <em>Anthropic</em>
                            </>
                          )}
                        </button>
                      </li>
                    )
                  })}
                  {Array.from({ length: FIELD_ROWS - mine.length }, (_, k) => (
                    <li key={k} aria-hidden="true">
                      <span className="ml-socket" />
                    </li>
                  ))}
                </ol>
                <span>{m}</span>
              </div>
            )
          })}
        </div>
        <p ref={read} className="ml-field-read">
          {DONE}
        </p>
        <ul className="ml-field-key">
          <li>on the list</li>
          <li className="ml-key--wait">waiting on a check</li>
          <li className="ml-key--warn">disputed or partly walked back</li>
        </ul>
      </div>
    </section>
  )
}
