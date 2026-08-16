import type { ProjectContent } from './types'
import { Figures, Pull, Term } from '../kit'

export const veil: ProjectContent = {
  lede: 'Every coding agent session starts blank: the codebase gets rediscovered, the fix that failed yesterday gets retried, and compaction throws out whatever the summarizer guessed was unimportant. Veil is an installable memory layer that keeps an LLM out of the memory path entirely, running on FSRS decay, AIMD eviction, and a record of every approach that already failed.',

  sections: [
    {
      id: 'compactions-blind-spot',
      title: 'What compaction misses',
      body: (
        <>
          <p>
            A session with no memory relearns the codebase every time it starts. It rediscovers a constraint you
            explained last week. It retries a fix that already failed.
          </p>
          <p>
            Compaction does not fix this. The summarizer keeps whatever looks important by a fixed heuristic and
            drops the rest, and the dropped part matters more often than the tool assumes.
          </p>
          <p>
            Veil replaces that summarizer with an eviction system. Each piece of context decays on its own
            schedule, so no single pass wipes a session.
          </p>
        </>
      ),
    },
    {
      id: 'install',
      title: 'Install',
      body: (
        <>
          <Term>{`npm install -g @engrammic/veil
cd your-project
veil`}</Term>
          <p>
            The package runs local-first on sqlite-vec embeddings. Nothing about your codebase leaves the machine,
            and it works with the network off.
          </p>
        </>
      ),
    },
    {
      id: 'a-forgetting-curve',
      title: 'How memory decays',
      body: (
        <>
          <p>
            Most cache eviction runs a plain age check: old enough, gone. Veil scores memory with FSRS instead, the
            algorithm behind spaced-repetition flashcard apps. Each item gets a stability value in days. Rather than
            decay in a straight line, retrievability drops from that stability on a power curve, so an item that
            keeps getting recalled stays sharp far longer than one recalled once and left alone.
          </p>
          <p>Stability starts low, and it differs by what kind of item it is.</p>
          <Figures
            items={[
              { value: '30m', label: 'observation' },
              { value: '2h', label: 'fact' },
              { value: '12h', label: 'decision' },
              { value: '∞', label: 'pinned intent', note: 'never decays' },
            ]}
          />
          <p>
            Once computed retrievability drops under 0.1, an item becomes a candidate for eviction. That holds no
            matter how recently it was written.
          </p>
        </>
      ),
    },
    {
      id: 'congestion-control',
      title: 'Eviction threshold',
      body: (
        <>
          <p>
            The retrievability threshold that decides what is low enough to evict changes as the session runs. It
            borrows the AIMD shape from TCP congestion control. Three evictions inside sixty seconds count as
            thrashing, and the threshold backs off, keeping more in context until things settle. Five idle minutes
            with no eviction let it creep back up. If an evicted item gets asked for again, that counts as a miss,
            and the threshold rises right away without waiting out the idle window. Nobody sets an eviction budget
            by hand; the threshold finds its own level from how the session is going.
          </p>
        </>
      ),
    },
    {
      id: 'no-model-in-the-loop',
      title: 'Scoring without a model',
      body: (
        <>
          <p>
            Deciding what a piece of context is worth does not call the LLM. Every item gets a weighted score from
            five metadata signals: FSRS retrievability for recency, a log-scaled access count for frequency, tag
            overlap with the current task, whether the item has a pointer into the structural graph, and a cognitive
            weight that tracks whether the item was present during past successes or failures. The weights are
            fixed: 0.30 for relevance, 0.25 for recency, 0.15 each for frequency, structure, and cognitive weight.
            The whole score runs as arithmetic.
          </p>
          <p>
            That keeps scoring under ten milliseconds on every turn. An eviction pass never becomes the thing the
            agent waits on. The score comes out the same twice in a row given the same inputs, which a model call
            cannot promise.
          </p>
        </>
      ),
    },
    {
      id: 'failure-memory',
      title: 'Failed attempts get remembered',
      body: (
        <>
          <p>
            Veil keeps a record of every attempt against a goal: what the agent did, the target, the outcome (pass,
            fail, partial, or uncertain), and a normalized fingerprint of the error. That fingerprint lets the same
            failure get recognized as the same failure even when the message text drifts. A convergence monitor
            watches the record. Five consecutive failures on the same goal, or ten turns with no measurable
            progress, and it escalates: a warning first, then a callback the harness can act on, then a hard stop if
            the agent keeps repeating an approach that already failed three times.
          </p>
          <p>
            Veil packages the same memory engine as an installable CLI; Engrammic runs it as infrastructure.
          </p>
          <Pull>With the failure record in place, an agent stops retrying a fix that already failed.</Pull>
        </>
      ),
    },
  ],
}
