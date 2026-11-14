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

const stops = [
  { time: '07:30', title: 'Morning call' },
  { time: '09:58', title: 'It calls you first' },
  { time: '10:48', title: 'Notes in, follow-up sent' },
  { time: '13:10', title: 'Inbox handled' },
  { time: '16:40', title: 'Asked, answered, cited' },
  { time: '18:30', title: 'Your day, handled' },
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
        <h2 id="fo-day-h">One day, as folo runs it</h2>
        <p>here&rsquo;s a normal day with folo running it.</p>
      </div>
      <div ref={scope} className={`fo-day-grid${reduced ? ' fo-stacked' : ''}`}>
        <ol className="fo-rail">
          {stops.map((s, i) => (
            <li key={s.time} className={`fo-stop${i === active ? ' is-on' : ''}`}>
              <time className="fo-time">{s.time}</time>
              <h3>{s.title}</h3>
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

const beats = ['Hey folo, call Bob.', 'folo puts Alice through.', 'Then their agents sort out the rest.']

const exchange = [
  ['Alice’s folo', 'Sharing notes from the call', 'l'],
  ['Bob’s folo', 'Got them. Follow-up Thursday?', 'r'],
  ['Alice’s folo', 'Thursday 14:00, on both calendars.', 'l'],
] as const

function CallPhone({ name, state, live, dim }: { name: string; state: string; live?: boolean; dim?: boolean }) {
  return (
    <Phone time={live ? '14:02' : '14:00'} className={`fo-sm${dim ? ' is-dim' : ''}`}>
      <div className="fo-scene fo-callscene">
        <div className="fo-call">
          <div className="fo-av">{name[0]}</div>
          <div className="fo-name">{name}</div>
          <div className="fo-sub">{state}</div>
        </div>
        <div className="fo-end"><PhoneIcon /></div>
      </div>
    </Phone>
  )
}

function SayWho() {
  const reduced = useReduced()
  const [beat, setBeat] = useState(0)
  useEffect(() => { if (reduced) setBeat(2) }, [reduced])
  useEffect(() => {
    if (reduced) return
    const t = setTimeout(() => setBeat((b) => (b + 1) % 3), 3400)
    return () => clearTimeout(t)
  }, [beat, reduced])
  const state = ['Calling…', 'Connected · 00:04', 'Call ended · 04:12'][beat]
  return (
    <section className="fo-say-who" aria-labelledby="fo-who-h">
      <div className="fo-head">
        <h2 id="fo-who-h">Say who. folo puts you through.</h2>
        <p>you just say who, folo puts the call through, and after you hang up the two agents sort out the rest between themselves.</p>
      </div>
      <div className="fo-stage">
        <p className="fo-beat" key={beat}>{beats[beat]}</p>
        <div className="fo-pair">
          <CallPhone name="Bob" state={state} live={beat > 0} />
          <ol className={`fo-ex${beat === 2 ? ' is-on' : ''}`} aria-hidden={beat !== 2}>
            {exchange.map(([who, text, side]) => (
              <li key={text} className={`fo-ex-${side}`}>
                <small>{who}</small>
                <span>{text}</span>
              </li>
            ))}
          </ol>
          <CallPhone name="Alice" state={beat === 0 ? '' : state} live={beat > 0} dim={beat === 0} />
        </div>
        <div className="fo-steps" role="group" aria-label="Steps">
          {beats.map((b, i) => (
            <button key={b} type="button" aria-pressed={i === beat} aria-label={`Step ${i + 1}: ${b}`} onClick={() => setBeat(i)}>
              0{i + 1}
            </button>
          ))}
        </div>
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
    <section className="fo-under" aria-labelledby="fo-under-h">
      <div className="fo-head">
        <h2 id="fo-under-h">What&rsquo;s under it</h2>
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
            <h1>Need something done?<br /><span>Just talk to your folo.</span></h1>
            <p className="fo-sub1">An on-call COO for founders.</p>
            <p className="fo-lede">{c.lede}</p>
            <a className="fo-btn" href={WAITLIST} target="_blank" rel="noopener noreferrer">Join the waitlist <span aria-hidden="true">↗</span></a>
          </div>
          <div className="fo-hero-phone" aria-hidden="true">
            <Phone time="07:30" className="fo-lg"><Scene i={0} /></Phone>
          </div>
        </header>

        <Day />
        <SayWho />
        <Under />

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
