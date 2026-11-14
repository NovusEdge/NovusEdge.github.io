import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../../lib/motion'
import { TLink } from '../../components/page-transition'
import { useLocalePath } from '../../i18n/use-locale-path'
import type { LayoutProps } from './layouts'
import { Flock } from './flocc-flock'
import './flocc.css'

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
  ['Unattended agents can’t ask.', 'Permission dialogs, AskUserQuestion and plan mode are denied by managed settings. Anything that needs me goes out as a question when the run ends, because a session waiting on an answer at 3am waits until morning.'],
  ['Agents don’t push.', 'Sessions commit in their worktree. The service runs the check, pushes and opens the draft PR, so “done” means nothing until the check passes.'],
  ['Tests come from someone else.', 'A tester session writes the tests first. If the executor touches the tester’s files, the run is rejected.'],
  ['Check main before blaming the branch.', 'When a check fails, the same check runs on the base branch. If main is broken too, the repo is held and no fixer burns a round on it.'],
  ['Every loop has a cap.', 'Two check-fix rounds, one review-fix round, three comment fixes a week, and usage thresholds before anything starts.'],
  ['Done is a command.', <>A session ends only by running <code>flocc done</code>. Finishing with no commits blocks as <code>no-changes</code>.</>],
  ['State lives outside the context window.', 'Commits, a summary file and the Linear issue carry the run, so a crash or a compaction loses nothing.'],
  ['Nobody grades their own work.', 'The reviewer is a fresh, read-only session on the same worktree, checking the diff against each acceptance criterion.'],
  ['No criteria, no run.', 'An issue without an acceptance-criteria list is skipped with a comment. Specs live in the repo because sessions don’t open attachments or follow links.'],
  ['Hooks are a courtesy; users are the wall.', 'The guard hook tells an agent early why a call is refused. The real boundary is Unix: the agent runs as its own user and cannot read the Linear key, the push token or the ledger.'],
] as const

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
    <ol ref={scope} className="fl-life" aria-label="Lifecycle of an issue">
      <i className="fl-marker" aria-hidden="true" />
      {stages.map((s, i) => (
        <li key={s.name} className={s.yours ? 'fl-yours' : 'fl-flocc'}>
          {(i === 0 || stages[i - 1].yours !== s.yours) && <span className="fl-tag fl-seg" aria-hidden="true">{s.yours ? 'yours' : 'flocc'}</span>}
          <span className="fl-sr">{s.yours ? 'yours' : 'flocc'}: </span>
          <h3>{s.name}</h3>
          <p>{s.caption}</p>
        </li>
      ))}
    </ol>
  )
}

export default function Flocc({ c }: LayoutProps) {
  const lp = useLocalePath()
  return (
    <main className="fl">
      <div className="fl-shell">
        <nav className="fl-masthead" aria-label="Project">
          <TLink to={lp('/portfolio')}>← Portfolio</TLink>
          <span className="fl-wordmark">flocc <span lang="ja">群</span></span>
        </nav>

        <header className="fl-hero">
          <Flock />
          <div className="fl-hero-copy">
            <h1>I do the thinking.<br /><span>flocc does the rest.</span></h1>
            <div className="fl-hero-bottom">
              <p>{c.lede}</p>
              <a href="#notes" className="fl-text-button">Read the notes <span aria-hidden="true">↓</span></a>
            </div>
          </div>
        </header>

        <section className="fl-editorial">
          <div className="fl-section-marker"><span>01</span><p>Who does what</p></div>
          <div className="fl-editorial-body">
            <h2>The thinking stays with me</h2>
            <p>I&rsquo;ve been using Claude Code since it came out, and the part I&rsquo;m surest about is that the thinking doesn&rsquo;t hand off. Brainstorming, the spec, what &ldquo;done&rdquo; means: those happen with me in the room, usually arguing with a separate agent until the acceptance criteria stop moving.</p>
            <p>flocc started because the part after that, the executing, was where my time was actually going. So it does that part and nothing else. An issue without acceptance criteria gets skipped with a comment saying why, and specs live in the repo, merged, because a session never follows a link.</p>
          </div>
        </section>

        <Lifecycle />

        <section className="fl-editorial fl-factory">
          <div className="fl-section-marker"><span>02</span><p>The dark factory</p></div>
          <div className="fl-editorial-body">
            <h2>Not a dark factory</h2>
            <p>The word for this in 2026 is a software factory, and most of the talk this year has been about turning the lights off.</p>
            <Quote q={quotes[0]} />
            <p>T&iacute;&#382;kov&aacute;&rsquo;s factory owns the whole loop, spec included. Horthy tried running one with nobody reading the code and spent the following months digging through it. His reason is the one I keep coming back to: &ldquo;the cost function of bad architecture is measured in months and years.&rdquo; No test catches that, so somebody has to be thinking about it, and that somebody is me.</p>
            <Quote q={quotes[1]} />
            <Quote q={quotes[2]} />
            <p>That line is most of flocc&rsquo;s design. Where I could turn an instruction into something the system enforces, I did.</p>

            <figure className="fl-ladder">
              <ol>
                {rungs.map((r) => (
                  <li key={r.n} className={r.n === 4 ? 'fl-rung-flocc' : r.n === 5 ? 'fl-rung-dim' : undefined}>
                    <span className="fl-rung-n">{r.n}</span>
                    <div>
                      <strong>{r.label}</strong>
                      {r.note && <em>{r.note}</em>}
                    </div>
                    {r.n === 4 && <span className="fl-tag">flocc</span>}
                  </li>
                ))}
              </ol>
              <figcaption>
                flocc stops at four on purpose. Five needs something that can tell bad design from working code, and that is still a person.
                <a href="https://www.danshapiro.com/blog/2026/01/the-five-levels-from-spicy-autocomplete-to-the-software-factory/" target="_blank" rel="noopener noreferrer">Dan Shapiro, the five levels <span aria-hidden="true">↗</span></a>
              </figcaption>
            </figure>
          </div>
        </section>

        <section id="notes" className="fl-notes">
          <h2>What running agents taught me</h2>
          <div className="fl-cards">
            {notes.map(([title, body], i) => (
              <details key={title} className="fl-card">
                <summary><span>{String(i + 1).padStart(2, '0')}</span>{title}</summary>
                <p>{body}</p>
              </details>
            ))}
          </div>
        </section>

        <footer className="fl-close">
          <div>
            <h2>flocc<span lang="ja">群</span></h2>
            <p>A Go command on my desktop and a standard-library Python service on each host. Built for one owner running a few hosts, not a team sharing one service. The repo is private.</p>
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

function Quote({ q }: { q: (typeof quotes)[number] }) {
  return (
    <figure className="fl-quote">
      <blockquote><span className="fl-q">&ldquo;</span>{q.text}&rdquo;</blockquote>
      <figcaption>
        {q.by}
        <a href={q.href} target="_blank" rel="noopener noreferrer">Source <span aria-hidden="true">↗</span></a>
      </figcaption>
    </figure>
  )
}
