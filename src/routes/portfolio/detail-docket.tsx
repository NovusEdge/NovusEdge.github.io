import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '../../lib/motion'
import { TLink } from '../../components/page-transition'
import { useLocalePath } from '../../i18n/use-locale-path'
import type { LayoutProps } from './layouts'
import { DecisionFlow } from './docket-flow'
import './docket.css'

const stages = ['Explore', 'Commit', 'Continue'] as const

function ReasoningSequence() {
  const [stage, setStage] = useState(1)
  const scope = useRef<HTMLElement>(null)
  useGSAP(() => {
    if (prefersReducedMotion()) return
    const flow = gsap.timeline()
    flow.fromTo('.dk-branch-line', { scaleX: 0 }, { scaleX: 1, duration: 0.55, stagger: 0.12, ease: 'power2.out' })
    flow.fromTo('.dk-branch-mark', { opacity: 0.25 }, { opacity: 1, duration: 0.3, stagger: 0.12 }, 0.3)
    flow.fromTo('.dk-record-line', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.6, ease: 'power2.out' }, 0.55)
  }, { scope, dependencies: [stage], revertOnUpdate: true })
  return (
    <section ref={scope} className="dk-sequence" aria-label="Illustrative agent reasoning sequence">
      <div className="dk-sequence-top">
        <p className="dk-label">One problem. Several possible directions.</p>
        <div className="dk-stage-control" aria-label="Reasoning stage">
          {stages.map((label, index) => (
            <button key={label} type="button" aria-pressed={stage === index} onClick={() => setStage(index)}>
              <span aria-hidden="true">0{index + 1}</span> {label}
            </button>
          ))}
        </div>
      </div>

      <div className={`dk-flow dk-flow-${stage}`}>
        <div className="dk-problem">
          <span className="dk-label">Agent task</span>
          <p>Plan a team trip</p>
          <span className="dk-flow-arrow" aria-hidden="true">→</span>
        </div>
        <div className="dk-branches">
          <div className={`dk-branch ${stage > 0 ? 'dk-branch-rejected' : ''}`}>
            <i className="dk-branch-line" aria-hidden="true" />
            <span className="dk-branch-mark" aria-hidden="true">{stage > 0 ? '×' : '·'}</span>
            <span className="dk-branch-label">Fixed bookings</span>
            <small>{stage > 0 ? 'Ruled out' : 'Explore'}</small>
          </div>
          <div className={`dk-branch ${stage > 0 ? 'dk-branch-settled' : ''}`}>
            <i className="dk-branch-line" aria-hidden="true" />
            <span className="dk-branch-mark" aria-hidden="true">{stage > 0 ? '↳' : '·'}</span>
            <span className="dk-branch-label">Refundable bookings</span>
            <small>{stage > 0 ? 'Settled' : 'Explore'}</small>
          </div>
          <div className="dk-branch dk-branch-open">
            <i className="dk-branch-line" aria-hidden="true" />
            <span className="dk-branch-mark" aria-hidden="true">?</span>
            <span className="dk-branch-label">Final dates</span>
            <small>{stage > 0 ? 'Still open' : 'Explore'}</small>
          </div>
        </div>
        <div className="dk-next-step" aria-live="polite">
          <span className="dk-label">{stage === 2 ? 'Next step' : 'The decision record'}</span>
          <p>{stage === 0 ? 'Compare the options.' : stage === 1 ? 'Keep bookings refundable.' : 'Find flexible travel and rooms.'}</p>
          <span className="sr-only">
            {stage === 0 ? 'Nothing has been settled yet.' : stage === 1 ? 'The dates are not confirmed, so fixed bookings have been ruled out.' : 'The next agent knows to find refundable options while the final dates remain open.'}
          </span>
        </div>
      </div>

      <div className="dk-record-line">
        <span className="dk-label">{stage === 0 ? 'No commitment yet' : 'Carried forward'}</span>
        <p>{stage === 0 ? 'Explore before committing.' : 'Refundable only. Dates may change.'}</p>
      </div>
      <p className="dk-demo-note">Illustrative agent task. Step through an example of exploration, commitment, and continuation.</p>
    </section>
  )
}

function DependencyExample() {
  const [provisional, setProvisional] = useState(true)
  return (
    <div className="dk-dependency">
      <div className="dk-premise-row">
        <div>
          <span className="dk-label">The premise</span>
          <p>{provisional ? 'The trip dates are not confirmed.' : 'Everyone has confirmed the dates.'}</p>
        </div>
        <button className="dk-text-button" type="button" onClick={() => setProvisional((value) => !value)}>
          {provisional ? 'Confirm the dates' : 'Make dates provisional'} <span aria-hidden="true">↗</span>
        </button>
      </div>
      <div className="dk-support" aria-hidden="true"><span />because<span /></div>
      <div className="dk-dependent-row" aria-live="polite">
        <span className={`dk-status ${provisional ? '' : 'dk-status-open'}`}>{provisional ? 'Settled' : 'Worth revisiting'}</span>
        <h3>Only consider refundable bookings.</h3>
        <p>{provisional ? 'The team needs to be able to change the trip without losing its booking costs.' : 'Flexibility might still be worth paying for. The agent can now reconsider it instead of treating the old reason as permanent.'}</p>
      </div>
      <p className="dk-demo-note">Docket keeps the reasons and earlier choices. The agent checks what needs another look; Docket does not automatically cancel related decisions.</p>
    </div>
  )
}

function ProjectDrift() {
  const [tracked, setTracked] = useState(false)
  const consequences = tracked
    ? [
        ['Travel', 'Six tickets', 'The travel agent finds refundable tickets for all six people, arriving before dinner.'],
        ['Stay', 'Refundable rooms', 'The hotel agent filters for refundable reservations.'],
        ['Venue', 'Venue on hold', 'The venue agent proposes a hold that fits within the remaining trip budget.'],
      ]
    : [
        ['Travel', 'Four tickets', 'The travel agent picks a deal with only four available seats and an arrival after dinner.'],
        ['Stay', 'Prepaid rooms', 'The hotel agent recommends a cheaper, non-refundable room rate.'],
        ['Venue', 'Venue deposit', 'The venue agent selects an option whose deposit pushes the combined trip cost over the total budget.'],
      ]

  return (
    <section id="decision-drift" className="dk-drift">
      <div className="dk-drift-intro">
        <h2>Three agents find a good deal. The trip still goes wrong.</h2>
        <p>You ask an AI assistant to plan a trip for six people: €3,000 total, everyone there for dinner, and refundable bookings because the dates may change. It splits the search between travel, hotel, and venue agents. Do those decisions reach all three?</p>
      </div>
      <div className="dk-drift-controls" aria-label="Compare decision availability">
        <button type="button" aria-pressed={!tracked} onClick={() => setTracked(false)}>Decision missing</button>
        <button type="button" aria-pressed={tracked} onClick={() => setTracked(true)}>Decision available</button>
      </div>
      <figure className={`dk-impact-map ${tracked ? 'dk-impact-tracked' : ''}`}>
        <DecisionFlow tracked={tracked} consequences={consequences} />
        <figcaption>{tracked ? 'Travel includes everyone. Rooms stay refundable. The venue fits the shared budget.' : 'A flight deal leaves two people behind. The rooms lock in the dates. The venue pushes the trip over budget.'} <span>Illustrative planning example. No real bookings or measured outcomes.</span></figcaption>
      </figure>

      <div className="dk-drift-aftermath">
        <h3>The forgotten decision becomes everybody’s problem.</h3>
        <div>
          <p>If someone catches the mistake before booking, the agents have to redo their searches. If the bookings have already been made, changing the dates can mean losing money. One forgotten choice now affects the whole trip.</p>
          <p>The same pattern appears in larger projects. One agent makes a decision, another continues without the reason, and later tasks build on a different assumption. A long conversation may contain the answer somewhere. That does not mean the next agent will find it or recognise that it still applies.</p>
          <p>Docket gives the agent a specific decision to carry forward: “Refundable bookings only, because the dates are provisional.” It also keeps the rejected fixed-price options and the unanswered date question visible.</p>
        </div>
      </div>
    </section>
  )
}

function DecisionHandoff() {
  return (
    <section className="dk-handoff">
      <h2>Leave enough for the next agent to disagree intelligently.</h2>
      <p className="dk-handoff-lede">A useful record carries the question, the current answer, and the reason. It also leaves room for the part nobody has solved yet.</p>
      <div className="dk-handoff-layout">
        <dl className="dk-example-record">
          <div><dt>Question</dt><dd>Which bookings should the agents consider?</dd></div>
          <div><dt>Settled</dt><dd>Refundable options only.</dd></div>
          <div><dt>Because</dt><dd>The team has not confirmed the dates.</dd></div>
          <div><dt>Ruled out</dt><dd>Cheaper options that cannot be refunded.</dd></div>
          <div><dt>Still open</dt><dd>Which dates work for everyone?</dd></div>
        </dl>
        <div className="dk-handoff-reading">
          <h3>The next task starts with something to inspect.</h3>
          <p>The hotel agent can find refundable rooms without pretending the dates are final. The coordinating agent can check all three proposals against the same rule. A later agent can revisit that rule once everybody confirms their availability.</p>
          <p>Different tasks, one recorded decision. Each agent can work on its own part while keeping track of what is settled, what was rejected, and what still needs an answer.</p>
          <p className="dk-demo-note">Illustrative record. The entries must be written and maintained by the agent; Docket does not infer the right decisions from the conversation.</p>
        </div>
      </div>
    </section>
  )
}

export default function Docket({ p, c }: LayoutProps) {
  const lp = useLocalePath()
  return (
    <main className="dk">
      <div className="dk-shell">
        <nav className="dk-masthead" aria-label="Project">
          <TLink to={lp('/portfolio')}>← Portfolio</TLink>
          <span className="dk-wordmark">docket <span lang="ja">決</span></span>
          <a href={p.links[0].href} target="_blank" rel="noopener noreferrer">The project ↗</a>
        </nav>

        <header className="dk-hero">
          <p className="dk-label">Decision tracking for agents</p>
          <h1>Reasoning branches.<br /><span>Keep the decisions.</span></h1>
          <div className="dk-hero-bottom">
            <p>{c.lede}</p>
            <a href="#reasoning" className="dk-text-button">Follow the idea <span aria-hidden="true">↓</span></a>
          </div>
        </header>

        <ReasoningSequence />

        <section id="reasoning" className="dk-editorial">
          <div className="dk-section-marker"><span>01</span><p>Exploration creates commitments</p></div>
          <div className="dk-editorial-body">
            <h2>A complex task has more than one kind of unfinished business.</h2>
            <p>An agent working through a hard problem tries ideas, discovers constraints, rules things out, and changes its mind. Some questions get answers. Others need to stay open while the work moves elsewhere.</p>
            <p>Those distinctions matter to the next step. Reopening a rejected path can undo useful work. Treating an open question as settled can build the rest of the task on a guess.</p>
            <p>Docket gives the agent a place to record that structure as it reasons.</p>
          </div>
        </section>

        <section className="dk-states" aria-label="Three decision states">
          <div><span className="dk-state-symbol" aria-hidden="true">●</span><h3>Settled</h3><p>A commitment the next step can use.</p><blockquote>“Refundable bookings only. The dates might change.”</blockquote></div>
          <div><span className="dk-state-symbol" aria-hidden="true">×</span><h3>Ruled out</h3><p>A path the agent has already examined.</p><blockquote>“The cheaper fixed bookings would lock us into a date.”</blockquote></div>
          <div><span className="dk-state-symbol" aria-hidden="true">?</span><h3>Open</h3><p>A question that still needs an answer.</p><blockquote>“Which dates work for everyone?”</blockquote></div>
        </section>

        <ProjectDrift />

        <section className="dk-editorial dk-editorial-dependency">
          <div className="dk-section-marker"><span>02</span><p>The reason travels with the choice</p></div>
          <div className="dk-editorial-body">
            <h2>When the premise changes, know what to revisit.</h2>
            <p>“Refundable only” is a choice. “Refundable only because the dates might change” tells the next agent when that choice needs another look.</p>
            <p>A decision can link to the decisions that support it. When something changes, the agent can follow those links, check what still applies, and record a new choice without erasing the old reasoning.</p>
            <DependencyExample />
          </div>
        </section>

        <DecisionHandoff />

        <section className="dk-continuity">
          <p className="dk-label">Across the life of an agent task</p>
          <h2>The work can continue<br />from what was decided.</h2>
          <div className="dk-continuity-line" aria-hidden="true"><span>Explore</span><i /><span>Decide</span><i /><span>Resume</span><i /><span>Reconsider</span></div>
          <p>A conversation can be compacted or a session can end. The recorded decisions remain available. When the agent starts or resumes, Docket loads the current choices so reasoning can continue with those commitments in view.</p>
          <p className="dk-continuity-aside">A ledger preserves what the agent recorded. The agent still has to make a good decision, record it honestly, and reconsider it when the evidence changes.</p>
        </section>

        <footer className="dk-close">
          <div><p className="dk-label">The idea, implemented</p><h2>docket<span lang="ja">決</span></h2><p>An open-source decision ledger for complex agent work.</p></div>
          <div className="dk-close-links">
            <a href="https://github.com/NovusEdge/docket" target="_blank" rel="noopener noreferrer">Read the project <span aria-hidden="true">↗</span></a>
            <a href="https://github.com/NovusEdge/docket/blob/main/docs/installation.md" target="_blank" rel="noopener noreferrer">Installation <span aria-hidden="true">↗</span></a>
            <TLink to={lp('/portfolio')}>Back to portfolio <span aria-hidden="true">↗</span></TLink>
          </div>
        </footer>
      </div>
    </main>
  )
}
