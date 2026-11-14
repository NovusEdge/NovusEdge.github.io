import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../../lib/motion'
import { TLink } from '../../components/page-transition'
import { useLocalePath } from '../../i18n/use-locale-path'
import type { LayoutProps } from './layouts'
import { Flock } from './flocc-flock'
import './flocc.css'

const AeroShards = lazy(() => import('../../components/react-bits/bg/AeroShards'))

gsap.registerPlugin(ScrollTrigger)

const stages = [
  { name: 'Spec', yours: true, caption: 'Brainstorm, write it, merge it to the repo' },
  { name: 'Todo', yours: true, caption: 'Label the issue, assign it, move it to Todo' },
  { name: 'Worktree', yours: false, caption: <>Fresh branch, <code>./setup</code>, as a separate Unix user</> },
  { name: 'Test', yours: false, caption: 'A tester session writes tests that fail on wrong behaviour' },
  { name: 'Execute', yours: false, caption: 'A new session works from the issue and the tests' },
  { name: 'Check', yours: false, caption: "The repo's own check, outside the agent's reach" },
  { name: 'Draft PR', yours: false, caption: 'The service pushes; the agent never can' },
  { name: 'Review', yours: false, caption: 'A fresh read-only session grades the diff' },
  { name: 'Merge', yours: true, caption: 'I read it and merge by hand' },
]

const FIRST = stages.findIndex((s) => !s.yours)
const LAST = stages.length - 1 - [...stages].reverse().findIndex((s) => !s.yours)
const BRACKET_LABEL = Math.floor((FIRST + LAST) / 2)
const NUMERALS = [102, 104, 106, 108, 110, 112, 114, 116, 118]

const quotes = [
  {
    text: "I would define the software factory as the whole loop, the whole life cycle of developing software with autonomy, which doesn't mean just coding and generating code.",
    by: 'Tereza Tížková, Factory · AI Engineer World’s Fair 2026',
    href: 'https://agents.conffab.com/worlds-fair/live/day-1-keynotes/sessions/1782843000.md',
  },
  {
    text: 'I actually think agents really start to struggle after maybe three to six months, especially with the pace at which we can ship now.',
    by: 'Dex Horthy, HumanLayer · “Harness Engineering is not Enough” · AI Engineer World’s Fair 2026',
    href: 'https://www.youtube.com/watch?v=Ib5GBkD555M',
  },
  {
    text: 'A rule asks for behavior; a test supplies an observable result.',
    by: 'Eric Zakariasson, Cursor · “Building your own software factory” · AI Engineer Europe 2026 (edited transcript)',
    href: 'https://ai.engineer/talks/building-your-own-software-factory',
  },
]

const rungs = [
  { n: 0, label: 'Spicy autocomplete' },
  { n: 1, label: 'Coding intern' },
  { n: 2, label: 'Junior developer' },
  { n: 3, label: 'Developer', note: '“You spend your days reviewing code.”' },
  { n: 4, label: 'Engineering team', note: '“You write a spec. You argue with it about the spec.” … “check to see if the tests pass.”' },
  { n: 5, label: 'Dark software factory', note: '“a black box that turns specs into software.”' },
]

const notes = [
  ['Unattended agents can’t ask.', 'Permission dialogs, AskUserQuestion and plan mode are all switched off. anything that needs me goes out as a question when the run ends, cause otherwise a session asking something at 3am just sits there till I wake up.'],
  ['Agents don’t push.', 'Sessions commit in their worktree and that’s it. the service runs the check, pushes and opens the draft PR, so an agent saying it’s done doesn’t count until the check passes.'],
  ['Tests come from a different session.', 'A tester session writes the tests first. if the executor touches the tester’s files, the run gets rejected.'],
  ['Check main before blaming the branch.', 'When a check fails, the same check runs on main. if main’s broken too, the repo gets held and nobody burns a fix round on it.'],
  ['Every loop has a cap.', 'Two check-fix rounds, one review-fix round, three comment fixes a week, and usage limits before anything even starts.'],
  [<>Done means running <code>flocc done</code>.</>, <>A session only ends by running <code>flocc done</code>, and finishing with no commits blocks as <code>no-changes</code>.</>],
  ['State lives outside the context window.', 'Commits, a summary file and the Linear issue carry the run, so a crash or a compaction doesn’t lose anything.'],
  ['The reviewer is a separate session.', 'A fresh, read-only session reads the diff against each acceptance criterion. nothing grades its own work.'],
  ['No acceptance criteria, no run.', 'An issue without an acceptance-criteria list gets skipped with a comment. specs live in the repo since sessions don’t open attachments or follow links.'],
  ['Hooks aren’t the security boundary.', 'The guard hook just tells an agent early why a call got refused. the real wall is Unix users: the agent runs as its own user and can’t read the Linear key, the push token or the ledger.'],
] as const

function useSheetClass() {
  useEffect(() => {
    document.documentElement.classList.add('flocc-sheet')
    return () => document.documentElement.classList.remove('flocc-sheet')
  }, [])
}

function Lifecycle() {
  const scope = useRef<HTMLOListElement>(null)
  useGSAP(() => {
    const ol = scope.current
    if (!ol || prefersReducedMotion()) return
    const marker = ol.querySelector<HTMLElement>('.fl-marker')!
    gsap.set(marker, { opacity: 1 })
    gsap.fromTo(ol, { '--fl-p': 0 }, {
      '--fl-p': 1,
      ease: 'none',
      scrollTrigger: { trigger: ol, start: 'top 80%', end: 'bottom 40%', scrub: true },
    })
  }, { scope })
  return (
    <figure className="fl-fig fl-fig2">
      <ol ref={scope} className="fl-life" aria-label="Lifecycle of an issue">
        <i className="fl-marker" aria-hidden="true" />
        {stages.map((s, i) => (
          <li key={s.name} className={s.yours ? 'fl-yours' : `fl-flocc${i === FIRST ? ' fl-first' : ''}${i === LAST ? ' fl-last' : ''}`}>
            <span className="fl-num" aria-hidden="true">{NUMERALS[i]}</span>
            <div className="fl-box">
              <span className="fl-sr">{s.yours ? 'yours' : 'flocc'}: </span>
              <h3>{s.name}</h3>
            </div>
            <p className="fl-cap">{s.caption}</p>
            {i === BRACKET_LABEL && <span className="fl-brk" aria-hidden="true">flocc</span>}
          </li>
        ))}
      </ol>
      <figcaption>
        <b>FIG. 2</b>
        <span className="fl-legend"><i aria-hidden="true" /> hatched: performed by the inventor</span>
      </figcaption>
    </figure>
  )
}

function useSiteState() {
  const [s, setS] = useState({ dark: false, reduced: false })
  useEffect(() => {
    const read = () => setS({ dark: document.documentElement.classList.contains('dark'), reduced: prefersReducedMotion() })
    read()
    const mo = new MutationObserver(read)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => mo.disconnect()
  }, [])
  return s
}

function Fig1() {
  const { dark, reduced } = useSiteState()
  const [failed, setFailed] = useState(false)
  const [gpu, setGpu] = useState(false)
  useEffect(() => setGpu('gpu' in navigator), [])
  const shards = gpu && !failed && !reduced
  return (
    <figure className="fl-fig fl-fig1">
      <div className="fl-hero-art">
        {shards ? (
          <Suspense fallback={<Flock />}>
            <AeroShards
              shardColor={dark ? '#eef3f8' : '#141414'}
              accentColor={dark ? '#eef3f8' : '#141414'}
              backgroundColor={dark ? '#163a63' : '#f3efe4'}
              lightMode={!dark}
              markers="plus"
              placement="full"
              glow={0.1}
              vignette={0}
              onError={() => setFailed(true)}
            />
          </Suspense>
        ) : (
          <Flock />
        )}
      </div>
      <figcaption><b>FIG. 1</b></figcaption>
    </figure>
  )
}

export default function Flocc({ c }: LayoutProps) {
  const lp = useLocalePath()
  useSheetClass()
  return (
    <main className="fl">
      <div className="fl-shell">
        <div className="fl-strip" aria-hidden="true">
          <span>U.S. Patent</span><span>Nov. 14, 2026</span><span>Sheet 1 of 3</span><span>flocc</span>
        </div>
        <nav className="fl-masthead" aria-label="Project">
          <TLink to={lp('/portfolio')}>← Portfolio</TLink>
          <span className="fl-wordmark">flocc <span lang="ja">群</span></span>
        </nav>

        <header className="fl-hero">
          <h1>I do the thinking.<br /><span>flocc does the rest.</span></h1>
          <dl className="fl-front">
            <div><dt>[54]</dt><dd className="fl-title54">SYSTEM FOR EXECUTING SPECIFIED SOFTWARE WORK WITH UNATTENDED AGENTS</dd></div>
            <div><dt>[76]</dt><dd>Inventor: A. Khimani, Finland</dd></div>
            <div className="fl-abstract"><dt>[57]</dt><dd><b>ABSTRACT</b><p>{c.lede}</p><a href="#notes" className="fl-text-button">Read the notes <span aria-hidden="true">↓</span></a></dd></div>
          </dl>
        </header>

        <Fig1 />

        <section className="fl-editorial">
          <div className="fl-section-marker"><h2>Detailed description</h2><p>Who does what</p></div>
          <div className="fl-editorial-body">
            <h3>The thinking stays with me</h3>
            <p>I&rsquo;ve been on Claude Code pretty much since it came out, and if there&rsquo;s one thing I&rsquo;ve learned it&rsquo;s that I can&rsquo;t hand off the thinking. brainstorming, the spec, what &ldquo;done&rdquo; even means, that&rsquo;s all me, usually going back and forth with a separate agent until the acceptance criteria stop changing.</p>
            <p>the executing tho, that&rsquo;s where all my time was actually going, so flocc does that and only that. if an issue shows up with no acceptance criteria it skips it and leaves a comment saying why, and specs have to be merged into the repo first cause a session won&rsquo;t open links.</p>
          </div>
        </section>

        <Lifecycle />

        <section className="fl-editorial fl-factory">
          <div className="fl-section-marker"><h2>References cited</h2><p>The dark factory</p></div>
          <div className="fl-editorial-body">
            <h3>Not a dark factory</h3>
            <p>everyone&rsquo;s calling this a software factory now, and a lot of the talk this year has been about running one with the lights off, where nobody reads the code.</p>
            <Quote q={quotes[0]} n={1} />
            <p>her factory owns the whole loop, spec included, which is exactly the bit I won&rsquo;t give up. Horthy&rsquo;s team actually tried the nobody-reads-the-code thing and spent the next few months digging through it. his line on why stuck with me: &ldquo;the cost function of bad architecture is measured in months and years.&rdquo; no test is gonna catch that, so someone has to be thinking about it, and I&rsquo;d rather it be me.</p>
            <Quote q={quotes[1]} n={2} />
            <Quote q={quotes[2]} n={3} />
            <p>that&rsquo;s pretty much how flocc got built. anywhere I could turn an instruction into something the system just enforces, I did.</p>

            <figure className="fl-fig fl-ladder">
              <ol>
                {rungs.map((r) => (
                  <li key={r.n} className={r.n === 4 ? 'fl-rung-flocc' : r.n === 5 ? 'fl-rung-dim' : undefined}>
                    <span className="fl-rung-n">{r.n}</span>
                    <div>
                      <strong>{r.label}</strong>
                      {r.note && <em>{r.note}</em>}
                    </div>
                    {r.n === 4 && <span className="fl-dim"><span className="fl-tag">flocc</span></span>}
                  </li>
                ))}
              </ol>
              <figcaption>
                <b>FIG. 3</b>
                flocc sits at four on purpose. getting to five means something has to tell bad design apart from code that works, and right now that&rsquo;s still a person.
                <a href="https://www.danshapiro.com/blog/2026/01/the-five-levels-from-spicy-autocomplete-to-the-software-factory/" target="_blank" rel="noopener noreferrer">Dan Shapiro, the five levels <span aria-hidden="true">↗</span></a>
              </figcaption>
            </figure>
          </div>
        </section>

        <section id="notes" className="fl-notes">
          <h2>What is claimed is</h2>
          <h3>What running agents taught me</h3>
          <ol className="fl-claims">
            {notes.map(([title, body], i) => (
              <li key={i}>
                <b>{title}</b> {body}
              </li>
            ))}
          </ol>
        </section>

        <footer className="fl-close">
          <div>
            <h2>flocc<span lang="ja">群</span></h2>
            <p>A Go command on my desktop and a plain-Python service on each host. it&rsquo;s built for me running a few hosts, not a team sharing one. the repo&rsquo;s private.</p>
            <p className="fl-stack">Go · Python · Claude Code · Linear · systemd · tmux · Tailscale · Incus</p>
          </div>
          <div className="fl-close-links">
            <TLink to={lp('/portfolio')}>← Back to portfolio</TLink>
          </div>
        </footer>
      </div>
    </main>
  )
}

function Quote({ q, n }: { q: (typeof quotes)[number]; n: number }) {
  return (
    <figure className="fl-quote">
      <span className="fl-ref" aria-hidden="true">[{n}]</span>
      <blockquote>&ldquo;{q.text}&rdquo;</blockquote>
      <figcaption>
        {q.by}
        <a href={q.href} target="_blank" rel="noopener noreferrer">Source <span aria-hidden="true">↗</span></a>
      </figcaption>
    </figure>
  )
}
