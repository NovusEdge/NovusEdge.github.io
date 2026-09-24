import type { ProjectContent } from './types'
import { Figures, Term } from '../kit'

export const veil: ProjectContent = {
  lede: 'Veil is a coding agent built on Pi. It keeps context in a local store, scores what stays in the prompt, and records failed attempts so later work can refer to them.',

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
            A conversation summary can omit a detail that becomes useful later. I wanted a way to retain and
            retrieve individual records as the active context changes.
          </p>
          <p>
            Veil scores context items and moves them between the active prompt and local storage. Eviction frees
            space in the prompt while keeping records available for retrieval.
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
            The memory store uses SQLite and sqlite-vec, with local embedding options. The coding agent's model
            provider is configured separately; choosing a remote model can send context to that provider.
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
            Veil uses an FSRS-based retrievability score, adapted from the
            algorithm behind spaced-repetition flashcard apps. Each item gets a stability value in days. Rather than
            decay in a straight line, retrievability drops from that stability on a power curve, so an item that
            is recalled repeatedly retains a higher score than one left unused.
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
            The controller adjusts the context-pressure threshold within configured limits. It responds to
            repeated evictions, requests for evicted items, and periods of stability.
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
            five metadata signals, and the weights are fixed. The whole score runs as arithmetic.
          </p>
          <p>
            Given the same item metadata, task tags, and time, the scorer returns the same result. Scoring does
            not require a language-model request.
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
            Veil records attempts against a goal: what the agent did, the target, the outcome, and a
            normalized fingerprint of the error. That fingerprint lets the same failure get recognized as the same
            failure even when the message text drifts.
          </p>
          <p>
            Veil integrates memory into the coding-agent loop. Engrammic provides a separate memory backend for
            agents through MCP.
          </p>
        </>
      ),
    },
  ],
}
