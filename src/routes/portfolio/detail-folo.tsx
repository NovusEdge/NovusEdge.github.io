import { useEffect, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../../lib/motion'
import { TLink } from '../../components/page-transition'
import { useLocalePath } from '../../i18n/use-locale-path'
import type { LayoutProps } from './layouts'
import './folo.css'

gsap.registerPlugin(ScrollTrigger)

const WAITLIST = 'https://askfolo.com'

function useSheetClass() {
  useEffect(() => {
    document.documentElement.classList.add('folo-sheet')
    return () => document.documentElement.classList.remove('folo-sheet')
  }, [])
}

function useReduced() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const read = () => setReduced(prefersReducedMotion())
    read()
    const mo = new MutationObserver(read)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    mq.addEventListener('change', read)
    return () => { mo.disconnect(); mq.removeEventListener('change', read) }
  }, [])
  return reduced
}

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
)

function Phone({ time, children, className = '' }: { time: string; children: ReactNode; className?: string }) {
  return (
    <div className={`fo-phone ${className}`}>
      <div className="fo-screen">
        <i className="fo-isl" />
        <div className="fo-sb"><span>{time}</span><span>folo</span></div>
        {children}
      </div>
    </div>
  )
}

const UNPROMPTED = 'folo, unprompted'
const stops = [
  { time: '07:30', title: 'Morning call', tag: UNPROMPTED },
  { time: '09:58', title: 'It calls you first', tag: UNPROMPTED },
  { time: '10:48', title: 'Notes in, follow-up sent', tag: UNPROMPTED },
  { time: '13:10', title: 'Inbox handled', tag: UNPROMPTED },
  { time: '16:40', title: 'Asked, answered, cited', tag: 'I asked' },
  { time: '18:30', title: 'Your day, handled', tag: UNPROMPTED },
]

const inbox = [
  ['Mikael', 'Replied', 'Re: invoice for October'],
  ['Sana', 'Replied', 'Pilot start, a few questions'],
  ['Stripe', 'Filed', 'Your payout is on the way'],
  ['Jonas', 'Replied', 'Hiring loop for the backend role'],
  ['Leah', 'Replied', 'Can we move Thursday?'],
  ['Notion', 'Filed', 'Weekly digest'],
]

function Scene({ i }: { i: number }) {
  switch (i) {
    case 0:
      return (
        <div className="fo-scene">
          <div className="fo-call">
            <div className="fo-av">f</div>
            <div className="fo-name">folo</div>
            <div className="fo-sub"><i className="fo-dot" /> 00:14 · morning call</div>
          </div>
          <p className="fo-say">Three things today. Sana at ten is the one that matters.</p>
          <ul className="fo-list">
            <li><span>10:00</span> Sana · pilot call</li>
            <li><span>14:00</span> Leah · 1:1</li>
            <li><span>17:00</span> Investor update goes out</li>
          </ul>
        </div>
      )
    case 1:
      return (
        <div className="fo-scene">
          <div className="fo-call">
            <div className="fo-av">f</div>
            <div className="fo-name">folo</div>
            <div className="fo-sub"><i className="fo-dot" /> calling · 2 min before Sana</div>
          </div>
          <p className="fo-say">This one matters. Pick up.</p>
          <p className="fo-note">Open with the start date.</p>
          <div className="fo-answer"><i><PhoneIcon /></i>Answer</div>
        </div>
      )
    case 2:
      return (
        <div className="fo-scene">
          <h4>After Sana</h4>
          <ul className="fo-rows">
            <li><span>Meeting notes</span><b>Shared</b></li>
            <li><span>Commitments · 2</span><b>Logged</b></li>
            <li><span>Follow-up · Sana</span><b>Sent</b></li>
          </ul>
          <p className="fo-card">Pilot starts 1 December. Pricing sheet to Sana by Friday.</p>
        </div>
      )
    case 3:
      return (
        <div className="fo-scene">
          <h4>Inbox</h4>
          <ul className="fo-inbox">
            {inbox.map(([who, st, subj]) => (
              <li key={who}>
                <div><span>{who}</span><b className={st === 'Filed' ? 'fo-filed' : undefined}>{st}</b></div>
                <small>{subj}</small>
              </li>
            ))}
          </ul>
          <p className="fo-foot">6 handled · 4 replied · 2 filed</p>
        </div>
      )
    case 4:
      return (
        <div className="fo-scene fo-chat">
          <p className="fo-bub fo-me">what did they say about pricing?</p>
          <p className="fo-bub fo-fo">
            €2k a month works for the pilot. Sana wants the annual number by Friday.
            <small>call 10:14 · "two thousand a month is fine for the pilot"</small>
          </p>
          <p className="fo-bub fo-me">and the start date?</p>
          <p className="fo-bub fo-fo">1 December, if the pilot scope holds. Her words at 10:16.</p>
        </div>
      )
    default:
      return (
        <div className="fo-scene">
          <h4>Your day, handled</h4>
          <ul className="fo-stats">
            <li><b>3</b> meetings captured</li>
            <li><b>6</b> follow-ups sent</li>
            <li><b>4</b> replies sent</li>
            <li><b>1</b> call put through</li>
          </ul>
          <p className="fo-foot">Tomorrow starts with Leah at 09:00.</p>
        </div>
      )
  }
}

function Day() {
  const scope = useRef<HTMLDivElement>(null)
  const reduced = useReduced()
  const [active, setActive] = useState(0)
  useGSAP(() => {
    if (reduced) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 900px)', () => {
      gsap.utils.toArray<HTMLElement>('.fo-stop').forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => { if (self.isActive) setActive(i) },
        })
      })
    })
    return () => mm.revert()
  }, { scope, dependencies: [reduced] })

  return (
    <section className="fo-day" aria-labelledby="fo-day-h">
      <div className="fo-head">
        <h2 id="fo-day-h">The same day, up close</h2>
      </div>
      <div ref={scope} className={`fo-day-grid${reduced ? ' fo-stacked' : ''}`}>
        <ol className="fo-rail">
          {stops.map((s, i) => (
            <li key={s.time} className={`fo-stop${i === active ? ' is-on' : ''}`}>
              <time className="fo-time">{s.time}</time>
              <h3>{s.title}</h3>
              <span className={`fo-tag${s.tag === 'I asked' ? ' fo-asked' : ''}`}>{s.tag}</span>
              <Phone time={s.time} className="fo-inline">
                <Scene i={i} />
              </Phone>
            </li>
          ))}
        </ol>
        <div className="fo-sticky" aria-hidden="true">
          <Phone time={stops[active].time} className="fo-lg">
            {stops.map((_, i) => (
              <div key={i} className={`fo-fade${i === active ? ' is-on' : ''}`}><Scene i={i} /></div>
            ))}
          </Phone>
        </div>
      </div>
    </section>
  )
}

const T0 = 420
const SPAN = 690
const pct = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return ((h * 60 + m - T0) / SPAN) * 100
}
const ticks = ['07:00', '09:00', '11:00', '13:00', '15:00', '17:00']

type Ev = { t: string; me?: string; text: string; chip?: string; ask?: boolean }

const turnBased: Ev[] = [
  { t: '09:52', me: 'what’s my day look like?', text: 'You have 3 meetings: Sana at 10:00, Leah at 14:00, investor update at 17:00.', ask: true },
  { t: '11:20', me: 'write a follow-up to Sana', text: 'Here’s a draft. Want me to change anything?', ask: true },
  { t: '14:05', me: 'did Leah reply?', text: 'I don’t see a reply yet.', ask: true },
  { t: '16:40', me: 'what did Sana say about pricing?', text: 'I don’t have access to that call.', ask: true },
]

const foloDay: Ev[] = [
  { t: '07:30', text: 'Morning call: three things today, Sana’s the one that matters.' },
  { t: '09:58', text: 'Calls me two minutes before Sana.' },
  { t: '10:48', text: 'Notes shared, follow-up to Sana sent.' },
  { t: '13:10', text: 'Inbox handled: 4 replied, 2 filed.' },
  { t: '15:20', text: 'Leah’s 1:1 moved to Thursday.' },
  { t: '16:40', me: 'what did they say about pricing?', text: '€2k a month works for the pilot.', chip: 'call 10:14', ask: true },
]

function Plot({ events, gaps, label, side }: { events: Ev[]; gaps?: boolean; label: string; side: 'l' | 'r' }) {
  const edges = [...events.map((e) => pct(e.t)), 100]
  return (
    <div className={`fo-plot fo-${side}`} role="group" aria-label={label}>
      {ticks.map((t) => (
        <span key={t} className="fo-tick" style={{ top: `${pct(t)}%` }} aria-hidden="true"><time>{t}</time></span>
      ))}
      {gaps && (
        <>
          <span className="fo-gap" style={{ top: 0, bottom: `${100 - edges[0]}%` }} aria-hidden="true"><i>nothing happens</i></span>
          {events.map((e, i) => (
            <span key={e.t} className="fo-gap fo-gap-after" style={{ top: `${edges[i]}%`, bottom: `${100 - edges[i + 1]}%` }} aria-hidden="true"><i>nothing happens</i></span>
          ))}
        </>
      )}
      {events.map((e) => (
        <div key={e.t} className="fo-ev" style={{ top: `${pct(e.t)}%` }} data-ask={e.ask ? '' : undefined}>
          <time>{e.t}</time>
          {e.me && <p className="fo-q">{e.me}</p>}
          <p className="fo-a">{e.text}</p>
          {e.chip && <small className="fo-chip">{e.chip}</small>}
        </div>
      ))}
    </div>
  )
}

function Versus() {
  const scope = useRef<HTMLDivElement>(null)
  const reduced = useReduced()
  useGSAP(() => {
    if (reduced) return
    const mm = gsap.matchMedia()
    const fill = (plots: Element[], counters: Element[], trigger: Element) => {
      const tl = gsap.timeline({ paused: true })
      plots.forEach((plot, c) => {
        let n = 0
        const counter = counters[c]
        counter.textContent = '0'
        plot.querySelectorAll<HTMLElement>('.fo-ev, .fo-gap').forEach((el) => {
          const top = parseFloat(el.style.top) || 0
          const at = (top / 100) * 3
          tl.fromTo(el, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, at)
          if (el.hasAttribute('data-ask')) tl.call(() => { counter.textContent = String(++n) }, [], at)
        })
      })
      ScrollTrigger.create({ trigger, start: 'top 65%', once: true, onEnter: () => tl.play() })
    }
    const all = gsap.utils.toArray<Element>('.fo-plot', scope.current!)
    const counters = gsap.utils.toArray<Element>('.fo-count', scope.current!)
    mm.add('(min-width: 900px)', () => fill(all, counters, scope.current!.querySelector('.fo-plot')!))
    mm.add('(max-width: 899px)', () => all.forEach((p, i) => fill([p], [counters[i]], p)))
    return () => {
      mm.revert()
      counters.forEach((el, i) => { el.textContent = i ? '1' : '4' })
    }
  }, { scope, dependencies: [reduced] })

  return (
    <section className="fo-vs" aria-labelledby="fo-vs-h">
      <div className="fo-head">
        <h2 id="fo-vs-h">Same day, two assistants</h2>
      </div>
      <div ref={scope} className="fo-vs-grid">
        <div className="fo-vs-h fo-l">
          <h3>a turn-based assistant</h3>
          <p>illustrative, not any one product</p>
        </div>
        <Plot events={turnBased} gaps side="l" label="A turn-based assistant" />
        <p className="fo-counter fo-l"><b className="fo-count">4</b> times I had to ask</p>
        <div className="fo-vs-h fo-r">
          <h3>folo</h3>
        </div>
        <Plot events={foloDay} side="r" label="folo" />
        <p className="fo-counter fo-r"><b className="fo-count">1</b> times I had to ask</p>
      </div>
    </section>
  )
}

const rules = [
  'Every answer cites its sources.',
  'Each person only sees what they’re allowed to see, filtered in the database, not the prompt.',
  'Each service gets its own Postgres role and never imports another.',
  'Logs never carry names, emails, phone numbers or message text.',
]

function Under() {
  return (
    <div className="fo-under">
      <div className="fo-sub-head">
        <h3>What&rsquo;s under it</h3>
        <p>under the app it&rsquo;s a handful of small services, and most of my time so far has gone into the parts nobody sees: who&rsquo;s allowed to see what, and where every answer came from.</p>
      </div>
      <div className="fo-flow">
        <div className="fo-n fo-world">
          <b>Channels</b>
          <ul><li>SMS</li><li>Telegram</li><li>phone app</li><li>voice calls</li></ul>
        </div>
        <span className="fo-arr" aria-hidden="true">→</span>
        <div className="fo-n"><b>gateway</b><small>who&rsquo;s calling, spend caps, outbound calls</small></div>
        <span className="fo-arr" aria-hidden="true">→</span>
        <div className="fo-agentcol">
          <div className="fo-n fo-hub"><b>one agent per person</b></div>
          <span className="fo-arr fo-down" aria-hidden="true">→</span>
          <div className="fo-n fo-side"><b>model gateway</b><small>model picked per job</small></div>
        </div>
        <span className="fo-arr" aria-hidden="true">→</span>
        <div className="fo-stores">
          <div className="fo-n"><b>records</b><small>search with citations, scoped by role</small></div>
          <div className="fo-n"><b>context</b><small>memory of people and preferences</small></div>
          <div className="fo-n"><b>meetings</b><small>calendar sync, briefs</small></div>
        </div>
        <span className="fo-arr" aria-hidden="true">→</span>
        <div className="fo-n fo-db"><b>Postgres + pgvector</b></div>
      </div>
      <ol className="fo-rules">
        {rules.map((r) => <li key={r}>{r}</li>)}
      </ol>
      <p className="fo-status">it&rsquo;s in private beta, so none of this has run at scale yet.</p>
    </div>
  )
}

function Rogue() {
  return (
    <section className="fo-rogue" aria-labelledby="fo-rogue-h">
      <div className="fo-head">
        <h2 id="fo-rogue-h">Moving first, without going rogue</h2>
      </div>
      <div className="fo-prose">
        <p>the scary part of an assistant that acts on its own is that it acts on its own, so most of the work has gone into deciding where it&rsquo;s allowed to.</p>
        <p>routine stuff, follow-ups, holds, reschedules and replies, goes out without asking, each with its sources attached. it checks with me first before writing to someone new, or when a message has text in it that came from outside. and when the other person has folo too, the two agents sort out the follow-up between themselves after the call.</p>
      </div>
      <Under />
    </section>
  )
}

export default function Folo({ c }: LayoutProps) {
  const lp = useLocalePath()
  useSheetClass()
  return (
    <main className="fo">
      <div className="fo-shell">
        <nav className="fo-masthead" aria-label="Project">
          <TLink to={lp('/portfolio')}>← Portfolio</TLink>
          <span className="fo-wordmark">folo</span>
          <a href={WAITLIST} target="_blank" rel="noopener noreferrer">askfolo.com <span aria-hidden="true">↗</span></a>
        </nav>

        <header className="fo-hero">
          <div className="fo-hero-copy">
            <h1>I wanted an assistant<br /><span>that moves first.</span></h1>
            <p className="fo-sub1">folo, an on-call COO for founders.</p>
            <p className="fo-lede">{c.lede}</p>
            <a className="fo-btn" href={WAITLIST} target="_blank" rel="noopener noreferrer">Join the waitlist <span aria-hidden="true">↗</span></a>
          </div>
          <div className="fo-hero-phone" aria-hidden="true">
            <Phone time="07:30" className="fo-lg"><Scene i={0} /></Phone>
          </div>
        </header>

        <Versus />
        <Day />
        <Rogue />

        <footer className="fo-close">
          <div>
            <h2>folo</h2>
            <p>the code&rsquo;s private. if you&rsquo;re a founder and this sounds useful, get on the waitlist.</p>
            <p className="fo-stack">Python · FastAPI · Postgres + pgvector · Expo · Cloudflare Workers · ElevenLabs · Twilio · Nango · MCP</p>
          </div>
          <div className="fo-close-links">
            <a className="fo-btn" href={WAITLIST} target="_blank" rel="noopener noreferrer">askfolo.com <span aria-hidden="true">↗</span></a>
            <TLink to={lp('/portfolio')}>← Back to portfolio</TLink>
          </div>
        </footer>
      </div>
    </main>
  )
}
