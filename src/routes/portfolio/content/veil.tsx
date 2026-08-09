import type { ProjectContent } from './types'

export const veil: ProjectContent = {
  lede: 'Every coding agent session starts blank: the codebase gets rediscovered, the fix that failed yesterday gets retried, and compaction throws out whatever the summarizer guessed was unimportant. Veil is an installable memory layer that keeps an LLM out of the memory path entirely, running on FSRS decay, AIMD eviction, and a record of every approach that already failed.',

  sections: [
    {
      id: 'compactions-blind-spot',
      title: "Compaction's blind spot",
      body: (
        <>
          <p>
            A session with no memory relearns the codebase from zero every time it starts. It rediscovers the
            constraint you explained last week and retries the fix that already failed. Compaction does not solve
            this: the summarizer keeps whatever looks important by some fixed heuristic and drops the rest, and the
            rest turns out to matter more often than the tool admits.
          </p>
          <p>
            Veil replaces that summarizer with an eviction system that tracks each piece of context on its own
            schedule, instead of erasing a session in one pass.
          </p>
        </>
      ),
    },
    {
      id: 'install',
      title: 'One command',
      body: (
        <>
          <pre className="my-6 overflow-x-auto rounded border border-charcoal/10 bg-bone-tint/30 p-5 font-mono text-xs leading-relaxed text-charcoal/75 dark:border-bone/10 dark:bg-charcoal-tint/40 dark:text-bone/75">
            {`npm install -g @engrammic/veil
cd your-project
veil`}
          </pre>
          <p>
            The package runs local-first on sqlite-vec embeddings. Nothing about your codebase leaves the machine,
            and it works with the network off.
          </p>
        </>
      ),
    },
    {
      id: 'a-forgetting-curve',
      title: 'A forgetting curve',
      body: (
        <>
          <p>
            Most cache eviction runs on a plain age check: old enough, gone. Veil scores memory with FSRS, the
            algorithm behind spaced-repetition flashcard apps. Each item gets a stability value in days, and
            retrievability decays from that stability on a power curve rather than a straight line, so an item that
            keeps getting recalled stays sharp much longer than one recalled once and left alone.
          </p>
          <p>
            Stability starts low and differs by what the item is: a passing observation opens at roughly thirty
            minutes, a fact at two hours, a decision at twelve. Pin something as intent and its stability is set high
            enough that it never decays. Once computed retrievability drops under 0.1, the item is a candidate for
            eviction, no matter how recently it was written.
          </p>
        </>
      ),
    },
    {
      id: 'congestion-control',
      title: 'Congestion control for the eviction threshold',
      body: (
        <>
          <p>
            The retrievability threshold that decides what is low enough to evict is not fixed. It borrows the AIMD
            shape from TCP congestion control: three evictions inside sixty seconds counts as thrashing, and the
            threshold backs off, keeping more in context until things settle. Five idle minutes with no eviction lets
            it creep back up. If an evicted item gets asked for again, that counts as a miss, and the threshold rises
            right away instead of waiting out the idle window.
          </p>
          <p>Nobody sets an eviction budget by hand. The threshold finds its own level from how the session is going.</p>
        </>
      ),
    },
    {
      id: 'no-model-in-the-loop',
      title: 'No model in the loop',
      body: (
        <>
          <p>
            Deciding what a piece of context is worth does not call the LLM. Every item gets a weighted score from
            five metadata signals: FSRS retrievability for recency, a log-scaled access count for frequency, tag
            overlap with the current task, whether the item has a pointer into the structural graph, and a cognitive
            weight that tracks whether the item was present during past successes or failures. The weights are fixed
            (0.30 for relevance, 0.25 for recency, 0.15 each for frequency, structure, and cognitive weight), and
            the whole thing runs as arithmetic.
          </p>
          <p>
            That keeps scoring under ten milliseconds on every turn. An eviction pass never becomes the thing the
            agent is waiting on, and the score comes out the same twice in a row given the same inputs, which a model
            call does not.
          </p>
        </>
      ),
    },
    {
      id: 'failure-memory',
      title: 'An agent that remembers losing',
      body: (
        <>
          <p>
            Veil keeps a record of every attempt against a goal: what the agent did, the target, the outcome (pass,
            fail, partial, or uncertain), and a normalized fingerprint of the error so the same failure gets
            recognized as the same failure even when the message text drifts. A convergence monitor watches that
            record. Five consecutive failures on the same goal, or ten turns with no measurable progress, and it
            escalates: a warning first, then a callback the harness can act on, then a hard stop if the agent keeps
            repeating an approach that already failed three times.
          </p>
          <p>
            Veil packages the same memory engine as an installable CLI; Engrammic runs it as infrastructure. With the
            failure record in place, an agent stops retrying a fix that already failed and moves to something else
            instead.
          </p>
        </>
      ),
    },
  ],
}
