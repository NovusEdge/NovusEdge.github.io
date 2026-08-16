import type { ProjectContent } from './types'
import { Figures, Pull, Term } from '../kit'

export const engrammic: ProjectContent = {
  lede: "Ask most agent memory systems what they believe and they can't answer. They can tell you what sits nearby in vector space. Engrammic tracks the difference: every claim carries a source, and a claim has to earn fact status before an agent is allowed to act on it as true.",

  sections: [
    {
      id: 'no-referee',
      title: 'Why agents need a referee',
      body: (
        <>
          <p>
            Wire three agents to a shared memory and the room has no referee. One agent hallucinates that an API
            uses API keys. A second agent retrieves that claim as context and repeats it. A third builds a plan on
            top of it. Nobody in that chain ever asked whether the sentence was true the moment it entered the
            store.
          </p>
          <p>
            Galileo's analysis of multi-agent failures puts inter-agent misalignment at 36.9% of the total, with
            context saturation and retrieval noise close behind. Most memory products were built for one agent
            talking to one user. They have no concept of a claim a second agent should be allowed to doubt.
          </p>
        </>
      ),
    },
    {
      id: 'claim-to-fact',
      title: 'From claim to fact',
      body: (
        <>
          <p>
            Engrammic separates what an agent was told from what it has reason to hold. An observation enters as a{' '}
            <strong>claim</strong>, bound to the source that produced it. Claims accumulate corroboration and heat as
            other observations point the same direction. A claim that survives consensus crystallizes into a{' '}
            <strong>fact</strong>.
          </p>
          <p>
            Rather than overwriting a fact, a stronger claim supersedes it. A typed edge links the old fact to the
            one that replaced it. The old fact stays in the graph, marked as no longer current. Every write also
            carries two timestamps: one for when the thing happened, one for when the system learned it. A query
            for what an agent believed last Tuesday gets a real answer.
          </p>
          <Term>{`$ engrammic write --claim "the API uses API keys" --source session:4f21
✗ rejected: contradiction
  existing fact: "the API uses OAuth2" (crystallized 2026-04-02, 3 sources)
  resolve: supersede the existing fact, or add corroboration to this claim`}</Term>
        </>
      ),
    },
    {
      id: 'the-3-6-bit-ceiling',
      title: 'The 3.6-bit ceiling',
      body: (
        <>
          <p>
            Model weights are a bad place to keep a belief. They hold roughly 3.6 bits per parameter, split between
            generalizing and memorizing. That caps a 70-billion-parameter model at about 31GB of memorization
            capacity, before any of it goes toward reasoning. Correcting a belief stored there means retraining.
          </p>
          <Figures
            items={[
              { value: '3.6', label: 'bits per parameter', note: 'split between generalizing and memorizing' },
              { value: '31 GB', label: 'memorization ceiling', note: 'a 70B model, before it reasons at all' },
            ]}
          />

          <p>
            Forgetting there follows from the geometry. Gradient descent pushes new-task updates toward the
            directions that damage the old task most. Learning something new degrades what the model already knew,
            as a direct result of how it learns anything at all.
          </p>
          <p>
            Auditing fares no better. Superposition means a single neuron encodes pieces of many unrelated features
            at once. Asking what a model believes about anything means asking about a mixture of those features.
            Agents that write beliefs into their own separate weights diverge from each other for
            the same reason distributed systems partition: they share no substrate, so they reach no consensus.
            Brains solved this before anyone built a model. The hippocampus does fast, sparse encoding of what just
            happened. The neocortex does slow consolidation of what usually holds. One substrate cannot do both jobs
            at once.
          </p>
        </>
      ),
    },
    {
      id: 'primitives-engine-mcp',
      title: 'Packages and benchmarks',
      body: (
        <>
          <p>
            The schema lives in <code>engrammic-primitives</code>, licensed Apache 2.0. It defines the four
            cognitive layers, the edge types, and the scoring functions that decide when a claim earns promotion.
            The engine sits over a graph store and exposes an MCP server. Any agent that already speaks MCP reads and
            writes against it without a bespoke SDK.
          </p>
          <p>
            Manifold, a version of the same engine for latent embeddings instead of text, exists as a design
            document and nothing else. It waits on a customer who needs multimodal memory.
          </p>
          <p>
            The numbers below come from 500 annotated coding-agent sessions. Each one compares the write gate
            against an embedding-only, append-only baseline.
          </p>
          <Figures
            items={[
              { value: '95%', label: 'contradictions caught', note: 'baseline catches 66%' },
              { value: '87%', label: 'corrections propagated', note: 'baseline reaches 12%' },
              { value: '73%', label: 'contamination blocked', note: 'baseline lets it through' },
              { value: '165ms', label: 'median gate latency', note: 'the price of all three' },
            ]}
          />
          <p>The gate runs only on the writes that need the extra latency.</p>
        </>
      ),
    },
    {
      id: 'the-wager',
      title: 'What you get for the overhead',
      body: (
        <>
          <Pull>A belief needs a source. Everything else is output with confidence attached.</Pull>
          <p>
            Engrammic bets that the separation is worth its cost at write time. An agent running on it answers, on
            demand, what it knows, what it only generated, and which of the two a given conclusion rests on. An
            agent without that split answers none of them, and still sounds equally sure.
          </p>
        </>
      ),
    },
  ],
}
