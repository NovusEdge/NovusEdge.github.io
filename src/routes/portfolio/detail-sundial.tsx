import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../../lib/motion'
import { TLink } from '../../components/page-transition'
import { useLocalePath } from '../../i18n/use-locale-path'
import type { LayoutProps } from './layouts'
import SundialDial from './sundial-dial'
import './sundial.css'

gsap.registerPlugin(ScrollTrigger)

const PAPER = 'https://zenodo.org/records/23921544'
const DOI = 'https://doi.org/10.5281/zenodo.23921544'
const MODEL = 'https://huggingface.co/NovusEdge/sundial-qwen3.5-2b-T-int'

function useSheetClass() {
  useEffect(() => {
    document.documentElement.classList.add('sundial-sheet')
    return () => document.documentElement.classList.remove('sundial-sheet')
  }, [])
}

const pad = (n: number) => String(n).padStart(2, '0')
const fmtHere = (s: number) =>
  s >= 3600 ? `${Math.floor(s / 3600)}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}` : `${pad(Math.floor(s / 60))}:${pad(s % 60)}`

function VisitorClock() {
  const [t, setT] = useState({ here: 0, since: 0 })
  useEffect(() => {
    const t0 = Date.now()
    let last = t0
    const onScroll = () => { last = Date.now() }
    addEventListener('scroll', onScroll, { passive: true })
    const id = setInterval(() => {
      const n = Date.now()
      setT({ here: Math.floor((n - t0) / 1000), since: Math.floor((n - last) / 1000) })
    }, 1000)
    return () => { removeEventListener('scroll', onScroll); clearInterval(id) }
  }, [])
  return (
    <div className="sd-visitor">
      <p className="sd-clock" role="img" aria-label="time on page">
        <span aria-hidden="true">{"you've been here "}{fmtHere(t.here)} · last scrolled {t.since} s ago</span>
      </p>
      <p className="sd-clock-note">a clock for you. the model never gets one of these.</p>
    </div>
  )
}

const T0 = 9 * 60
const SPAN = 14 * 60
const at = (h: number, m: number) => ((h * 60 + m - T0) / SPAN) * 100
const ticks: [string, number][] = [['09:00', 0], ['12:00', 3], ['15:00', 6], ['18:00', 9], ['21:00', 12], ['23:00', 14]]

type Turn = { h: number; m: number; me?: boolean; text: string; note?: string }
const turns: Turn[] = [
  { h: 9, m: 12, me: true, text: 'kick off the eval and the docs subagent' },
  { h: 9, m: 13, text: 'subagent started' },
  { h: 9, m: 53, text: 'subagent finished', note: '40 min, usually 2' },
  { h: 22, m: 41, me: true, text: 'ok where were we?', note: '13 h later' },
]
const stamp = (t: Turn) => `${pad(t.h)}:${pad(t.m)}`

function Strips() {
  const flush = useRef<HTMLOListElement>(null)
  const scope = useRef<HTMLDivElement>(null)
  useGSAP(() => {
    if (prefersReducedMotion()) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 720px)', () => {
      const w = flush.current!.offsetWidth
      const cards = gsap.utils.toArray<HTMLElement>('.sd-card-flush', flush.current!)
      const tl = gsap.timeline({ paused: true })
      cards.forEach((el, i) => {
        const from = (at(turns[i].h, turns[i].m) / 100) * w - (w / 4) * i
        tl.fromTo(el, { x: from, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1.1, ease: 'power3.inOut' }, i * 0.08)
      })
      ScrollTrigger.create({ trigger: scope.current, start: 'top 70%', once: true, onEnter: () => tl.play() })
    })
    return () => mm.revert()
  }, { scope })

  return (
    <div ref={scope} className="sd-strips">
      <div className="sd-strip">
        <h3>what happened</h3>
        <div className="sd-plot" role="group" aria-label="what happened: the four turns on a real time axis">
          {turns.map((t, i) => {
            const p = at(t.h, t.m)
            const right = i === turns.length - 1
            return (
              <div
                key={stamp(t)}
                className={`sd-ev${right ? ' sd-ev-r' : ''}${t.me ? ' sd-me' : ''}`}
                style={{ [right ? 'right' : 'left']: right ? `${100 - p}%` : `${p}%`, top: `${i * 56}px` }}
              >
                <time>{stamp(t)}</time>
                <span>{t.text}</span>
                {t.note && <small>{t.note}</small>}
              </div>
            )
          })}
          <div className="sd-axis" aria-hidden="true">
            <span className="sd-gapbar" style={{ left: `${at(9, 53)}%`, width: `${at(22, 41) - at(9, 53)}%` }}><i>12 h 48 m</i></span>
            {ticks.map(([l, h], i) => (
              <span key={l} className={`sd-tick${i === 0 ? ' sd-tick-first' : i === ticks.length - 1 ? ' sd-tick-last' : ''}`} style={{ left: `${(h / 14) * 100}%` }}><time>{l}</time></span>
            ))}
            {turns.map((t) => (
              <b key={stamp(t)} className="sd-pip" style={{ left: `${at(t.h, t.m)}%` }} />
            ))}
          </div>
        </div>
      </div>

      <div className="sd-strip">
        <h3>what the model sees</h3>
        <ol ref={flush} className="sd-flush" aria-label="what the model sees: the same four turns back to back">
          {turns.map((t) => (
            <li key={stamp(t)} className={`sd-card-flush${t.me ? ' sd-me' : ''}`}>{t.text}</li>
          ))}
        </ol>
      </div>
    </div>
  )
}

const cards = [
  {
    id: 'EXP-003',
    chip: 'provisional',
    h: 'How long will a tool call take?',
    p: "a small text model reading the call lands within 2× of the real duration on 67.5% of calls, against 61.0% for just using each tool's median, and almost all of that is Bash. on subagents it's worse than the median, 40.3% against 59.8%, cause how long a subagent takes depends on the work, not the prompt.",
    foot: '70,565 calls, test week from 2026-10-21',
  },
  {
    id: 'EXP-005',
    chip: 'provisional · H3 passed',
    pass: true,
    h: 'When will this subagent finish?',
    p: "while a subagent runs, what it's doing tells you more about when it ends than how long it's been going. that one passed. a sequence model edged out the hand-made features, but not by enough to call it.",
  },
  {
    id: 'EXP-007',
    chip: 'paper · 1 of 4 passed',
    pass: true,
    h: 'Where should elapsed time go in?',
    p: "I adapted Qwen3.5-2B eight ways at the same trainable parameter budget, from timestamps written in the text to time fed straight into the layers. plain text plus fine-tuning won.",
    links: [['zenodo ↗', PAPER], ['doi ↗', DOI], ['model ↗', MODEL]],
  },
  {
    id: 'EXP-008',
    chip: 'provisional',
    h: 'Does it actually have a clock?',
    p: "you can read elapsed time out of the trained model really well (ρ around 0.99), but you can also read it out of a control trained on shuffled times (0.81 to 0.92). so being decodable isn't the same as having learned a clock.",
  },
]

export default function Sundial({ c }: LayoutProps) {
  const lp = useLocalePath()
  useSheetClass()
  return (
    <main className="sd">
      <div className="sd-shell">
        <nav className="sd-masthead" aria-label="Project">
          <TLink to={lp('/portfolio')}>← Portfolio</TLink>
          <span className="sd-wordmark">sundial <span lang="ja">時</span></span>
          <a href={PAPER} target="_blank" rel="noopener noreferrer">the paper <span aria-hidden="true">↗</span></a>
        </nav>

        <header className="sd-hero">
          <div className="sd-hero-copy">
            <h1>My agents don't know<br /><span>what time it is.</span></h1>
            <p className="sd-lede">{c.lede}</p>
            <VisitorClock />
          </div>
          <div className="sd-hero-dial"><SundialDial /></div>
        </header>

        <section className="sd-sec" aria-labelledby="sd-see-h">
          <div className="sd-head">
            <h2 id="sd-see-h">What the model sees</h2>
            <span className="sd-label">illustrative</span>
          </div>
          <Strips />
          <p className="sd-prose">to the model those four messages are back to back. it can't tell that the subagent took forty minutes when it usually takes two, or that I went to bed in between. so it either checks on things way too early or sits there way too long, and both waste time.</p>
        </section>

        <section className="sd-sec" aria-labelledby="sd-panel-h">
          <div className="sd-head">
            <h2 id="sd-panel-h">So I gave it a clock</h2>
          </div>
          <p className="sd-prose">I built a small Claude Code mod that tells the model what time it is: a clock line, an away line, and a line for each running subagent or command saying how long it's been going, how long runs like it usually take, and the chance it finishes in the next five minutes.</p>
          <div className="sd-panel">
            <figure className="sd-term">
              <figcaption aria-hidden="true"><i /><i /><i /></figcaption>
              <pre>{`[now 2026-11-14 18:39 · you were away 13 h 19 m]
subagent "Build flocc detail page": running 3 m · runs like this are usually done by 2 m · 67% chance it finishes in the next 5 m
Bash npx (background): running 14 m`}</pre>
            </figure>
            <article className="sd-exp">
              <span className="sd-chip sd-chip-run">EXP-010 · running</span>
              <h3>Does it actually help?</h3>
              <p>half my sessions get the panel and half don't, picked by a hash of the session id, and it counts how often the model pokes at background work before it's done. it might be hard to see tho: the baseline found agents only check early about 0.05 times per item, so even if the panel stopped early checks completely, there's only about a 64% chance a test at 70 sessions per arm would catch it.</p>
            </article>
          </div>
        </section>

        <section className="sd-sec" aria-labelledby="sd-found-h">
          <div className="sd-head">
            <h2 id="sd-found-h">What I've found so far</h2>
          </div>
          <div className="sd-grid">
            {cards.map((k) => (
              <article key={k.id} className="sd-exp">
                <div className="sd-exp-top">
                  <span className="sd-id">{k.id}</span>
                  <span className={`sd-chip${k.pass ? ' sd-chip-pass' : ''}`}>{k.chip}</span>
                </div>
                <h3>{k.h}</h3>
                <p>{k.p}</p>
                {k.foot && <p className="sd-foot">{k.foot}</p>}
                {k.links && (
                  <p className="sd-links">
                    {k.links.map(([l, href]) => (
                      <a key={l} href={href} target="_blank" rel="noopener noreferrer">{l}</a>
                    ))}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>

        <footer className="sd-close">
          <div>
            <h2>sundial <span lang="ja">時</span></h2>
            <p>the repo's private, the paper and the model aren't.</p>
            <p className="sd-stack">Python · PyTorch · LoRA · Qwen3.5-2B · ModernBERT · Claude Code</p>
          </div>
          <div className="sd-close-links">
            <a href={PAPER} target="_blank" rel="noopener noreferrer">the paper <span aria-hidden="true">↗</span></a>
            <a href={MODEL} target="_blank" rel="noopener noreferrer">the model <span aria-hidden="true">↗</span></a>
            <TLink to={lp('/portfolio')}>← Back to portfolio</TLink>
          </div>
        </footer>
      </div>
    </main>
  )
}
