import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { animate } from 'animejs'
import { MONTH_KANJI, RESULTS, STATUS_KEY, TRACES, tracesThrough, type Month, type Tone } from './timeline-data'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const MONTHS = Object.keys(MONTH_KANJI) as Month[]
const TONES = Object.keys(STATUS_KEY) as Tone[]
const TOTAL = tracesThrough(TRACES.length)
const pad = (n: number) => String(n).padStart(2, '0')

export function emphasised(text: string) {
  return text.split('*').map((part, i) => (i % 2 ? <em key={i}>{part}</em> : part))
}

// layout 'list' is the server and first-paint markup; 'pin' is the horizontal run on a desktop
// with motion allowed. `live` is false under reduced motion, where the list reports nothing.
export function Timeline({ layout, live, onCount }: { layout: 'list' | 'pin'; live: boolean; onCount: (count: number) => void }) {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLOListElement>(null)
  const spark = useRef<HTMLElement>(null)
  const report = useRef(onCount)
  report.current = onCount

  useGSAP(
    () => {
      const section = root.current!
      const pieces = gsap.utils.toArray<HTMLElement>('.ml-piece', section)
      const months = gsap.utils.toArray<HTMLElement>('.ml-tl-month span', section)
      const [resultNo, traceNo] = gsap.utils.toArray<HTMLElement>('.ml-tl-read b', section)
      let active = -1
      const setActive = (i: number) => {
        if (i === active) return
        const forward = i > active
        active = i
        pieces.forEach((p, k) => p.toggleAttribute('data-on', k === i))
        months.forEach((m) => m.toggleAttribute('data-on', m.dataset.month === RESULTS[i].month))
        resultNo.textContent = pad(i + 1)
        traceNo.textContent = pad(tracesThrough(i + 1))
        report.current(i + 1)
        if (layout === 'pin' && forward && spark.current) {
          const rise = spark.current.parentElement!.offsetHeight
          animate(spark.current, { translateY: [0, -rise], opacity: [1, 0], scale: [1.6, 0.5], duration: 750, ease: 'outQuart' })
        }
      }

      if (layout === 'list') {
        if (!live) return
        // The thread is there before the first strip arrives, so the count never drops below one.
        pieces.forEach((p, i) => {
          ScrollTrigger.create({ trigger: p, start: 'top 72%', onEnter: () => setActive(i), onLeaveBack: () => setActive(Math.max(0, i - 1)) })
        })
        setActive(0)
        return
      }

      let offsets: number[] = []
      let dist = 0
      const measure = () => {
        const first = pieces[0].offsetLeft
        offsets = pieces.map((p) => p.offsetLeft - first)
        dist = offsets[offsets.length - 1]
        // A little less than a pixel of scroll per pixel of travel, plus the dwell at each end.
        section.style.height = `${Math.round(innerHeight + dist * 0.85 + innerHeight * 0.5)}px`
      }
      measure()
      ScrollTrigger.addEventListener('refreshInit', measure)

      const sync = () => {
        const x = -(gsap.getProperty(track.current, 'x') as number)
        let i = 0
        while (i < offsets.length - 1 && offsets[i + 1] <= x + 140) i++
        setActive(i)
      }
      gsap
        .timeline({ scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true }, onUpdate: sync })
        .to({}, { duration: 0.07 })
        .to(track.current, { x: () => -dist, ease: 'none', duration: 1 })
        .to({}, { duration: 0.1 })
      setActive(0)

      return () => {
        ScrollTrigger.removeEventListener('refreshInit', measure)
        section.style.height = ''
      }
    },
    { scope: root, dependencies: [layout, live], revertOnUpdate: true },
  )

  return (
    <section ref={root} className={`ml-tl ml-tl--${layout}`} data-zone="timeline" aria-label="Results, July to November 2026">
      <div className="ml-tl-pin">
        <div className="ml-tl-month" aria-hidden="true" lang="ja">
          {MONTHS.map((m) => (
            <span key={m} data-month={m}>
              {MONTH_KANJI[m]}
            </span>
          ))}
        </div>
        <p className="ml-tl-read" aria-hidden="true">
          <span>
            result <b>01</b>/{pad(RESULTS.length)}
          </span>
          <span>
            traces <b>01</b>/{TOTAL}
          </span>
        </p>
        <div className="ml-tl-feed" aria-hidden="true">
          <i ref={spark} />
        </div>
        <ol ref={track} className="ml-tl-track">
          {RESULTS.map((r) => (
            <li key={r.what} className="ml-piece">
              <p className="ml-piece-when">{r.when}</p>
              <h3 className="ml-piece-what">{emphasised(r.what)}</h3>
              <p className="ml-piece-who">{r.who}</p>
              <span className={`ml-pill ml-pill--${r.tone}`}>{r.status}</span>
            </li>
          ))}
        </ol>
        <ul className="ml-tl-key">
          {TONES.map((tone) => (
            <li key={tone} className={`ml-key--${tone}`}>
              <i />
              <span>{STATUS_KEY[tone]}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
