import { useState } from 'react'
import { TLink } from '../../components/page-transition'
import { useLocalePath } from '../../i18n/use-locale-path'
import type { LayoutProps } from './layouts'
import './docket.css'

const stages = ['Explore', 'Commit', 'Continue'] as const

function ReasoningSequence() {
  const [stage, setStage] = useState(1)
  return (
    <section className="dk-sequence" aria-label="Illustrative agent reasoning sequence">
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
          <p>Design a research assistant that works offline.</p>
          <span className="dk-flow-arrow" aria-hidden="true">→</span>
        </div>
        <div className="dk-branches">
          <div className={`dk-branch ${stage > 0 ? 'dk-branch-rejected' : ''}`}>
            <span className="dk-branch-mark" aria-hidden="true">{stage > 0 ? '×' : '·'}</span>
            <span>Hosted retrieval</span>
            <small>{stage > 0 ? 'Ruled out: needs a connection' : 'An option to investigate'}</small>
          </div>
          <div className={`dk-branch ${stage > 0 ? 'dk-branch-settled' : ''}`}>
            <span className="dk-branch-mark" aria-hidden="true">{stage > 0 ? '↳' : '·'}</span>
            <span>A local index</span>
            <small>{stage > 0 ? 'Settled: retrieval stays offline' : 'An option to investigate'}</small>
          </div>
          <div className="dk-branch dk-branch-open">
            <span className="dk-branch-mark" aria-hidden="true">?</span>
            <span>Optional synchronisation</span>
            <small>{stage > 0 ? 'Open: decide what may leave the device' : 'An option to investigate'}</small>
          </div>
        </div>
        <div className="dk-next-step" aria-live="polite">
          <span className="dk-label">{stage === 2 ? 'Next step' : 'The decision record'}</span>
          <p>{stage === 0 ? 'Possibilities are still possibilities.' : stage === 1 ? 'Commitments become explicit.' : 'Plan ingestion for the local index.'}</p>
          <span className="dk-next-note">
            {stage === 0 ? 'Nothing has been settled yet.' : stage === 1 ? 'The choice, its reason, and the unresolved question stay together.' : 'The agent continues with a decision it can cite, and a question it still has to answer.'}
          </span>
        </div>
      </div>

      <div className="dk-record-line">
        <span className="dk-label">{stage === 0 ? 'No commitment yet' : 'Carried forward'}</span>
        <p>{stage === 0 ? 'Explore before committing.' : 'Local retrieval. Offline is a requirement. Sync remains open.'}</p>
      </div>
      <p className="dk-demo-note">Illustrative agent task. Step through an example of exploration, commitment, and continuation.</p>
    </section>
  )
}

function DependencyExample() {
  const [offline, setOffline] = useState(true)
  return (
    <div className="dk-dependency">
      <div className="dk-premise-row">
        <div>
          <span className="dk-label">The premise</span>
          <p>{offline ? 'The assistant must work offline.' : 'A connection is now guaranteed.'}</p>
        </div>
        <button className="dk-text-button" type="button" onClick={() => setOffline((value) => !value)}>
          {offline ? 'Change the premise' : 'Restore the premise'} <span aria-hidden="true">↗</span>
        </button>
      </div>
      <div className="dk-support" aria-hidden="true"><span />because<span /></div>
      <div className="dk-dependent-row" aria-live="polite">
        <span className={`dk-status ${offline ? '' : 'dk-status-open'}`}>{offline ? 'Settled' : 'Needs review'}</span>
        <h3>Keep retrieval local.</h3>
        <p>{offline ? 'This choice follows from the offline requirement.' : 'The choice might still be good. Its original justification is no longer enough.'}</p>
      </div>
      <p className="dk-demo-note">Docket records support and supersession. Dependent decisions are reviewed by the agent; the current tool does not automatically retire them.</p>
    </div>
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
          <div><span className="dk-state-symbol" aria-hidden="true">●</span><h3>Settled</h3><p>A commitment the next step can use.</p><blockquote>“Retrieval runs locally, because offline operation is required.”</blockquote></div>
          <div><span className="dk-state-symbol" aria-hidden="true">×</span><h3>Ruled out</h3><p>A path the agent has already examined.</p><blockquote>“Hosted retrieval would break the offline requirement.”</blockquote></div>
          <div><span className="dk-state-symbol" aria-hidden="true">?</span><h3>Open</h3><p>A question that still needs an answer.</p><blockquote>“Which data, if any, may be synchronised?”</blockquote></div>
        </section>

        <section className="dk-editorial dk-editorial-dependency">
          <div className="dk-section-marker"><span>02</span><p>The reason travels with the choice</p></div>
          <div className="dk-editorial-body">
            <h2>When the premise changes, know what to revisit.</h2>
            <p>“Use a local index” is an answer. “Use a local index because this must work offline” preserves something more useful: the condition that made the answer make sense.</p>
            <p>A decision can cite the decisions supporting it. Later reasoning can follow those links, check what still holds, and replace a commitment without erasing how it was reached.</p>
            <DependencyExample />
          </div>
        </section>

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
