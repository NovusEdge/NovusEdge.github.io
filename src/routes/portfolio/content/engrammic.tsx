import type { ProjectContent } from './types'

function Term({ children }: { children: string }) {
  return (
    <pre className="my-6 overflow-x-auto rounded border border-charcoal/10 bg-bone-tint/30 p-5 font-mono text-[10px] leading-relaxed text-charcoal/75 dark:border-bone/10 dark:bg-charcoal-tint/40 dark:text-bone/75 sm:text-xs">
      {children}
    </pre>
  )
}

export const engrammic: ProjectContent = {
  lede: "Ask most agent memory systems what they believe and they can't answer. They can tell you what sits nearby in vector space. Engrammic tracks the difference: every claim carries a source, and a claim has to earn fact status before an agent is allowed to act on it as true.",

  sections: [
    {
      id: 'no-referee',
      title: 'Two agents, one contradiction, no referee',
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
      title: 'A claim has to earn fact status',
      body: (
        <>
          <p>
            Engrammic separates what an agent was told from what it has reason to hold. An observation enters as a{' '}
            <strong>claim</strong>, bound to the source that produced it. Claims accumulate corroboration and heat as
            other observations point the same direction. A claim that survives consensus crystallizes into a{' '}
            <strong>fact</strong>.
          </p>
          <p>
            A stronger claim supersedes a fact rather than overwriting it. A typed edge links the old fact to the
            one that replaced it, and the old fact stays in the graph, marked as no longer current. Every write also carries two timestamps, one for when the thing happened and one for
            when the system learned it, so a query for what an agent believed last Tuesday gets a real answer.
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
            Model weights are a bad place to keep a belief. They hold roughly 3.6 bits per parameter, shared between
            generalizing and memorizing, which caps a 70-billion-parameter model at about 31GB of memorization
            capacity before any of it goes toward reasoning. Correcting a belief stored there means retraining.
          </p>
          <p>
            Forgetting there follows from the geometry. Gradient descent pushes new-task updates in
            the directions that damage the old task most, so learning something new degrades what the model already
            knew as a direct consequence of how it learns anything at all.
          </p>
          <p>
            Auditing fares no better. Superposition means a single neuron encodes pieces of many unrelated features
            at once, so asking what a model believes about anything is asking about a mixture, not a fact. Agents
            writing beliefs into their own separate weights diverge from each other for the same reason distributed
            systems partition: no shared substrate, no consensus. Brains reached this conclusion first. The
            hippocampus does fast, sparse encoding of what just happened, and the neocortex does slow consolidation
            of what usually holds, because one substrate cannot do both jobs at once.
          </p>
        </>
      ),
    },
    {
      id: 'primitives-engine-mcp',
      title: 'Primitives, engine, MCP',
      body: (
        <>
          <p>
            The schema lives in <code>engrammic-primitives</code>, Apache 2.0, defining the four cognitive layers,
            the edge types, and the scoring functions that decide when a claim earns promotion. The engine sits over
            a graph store and exposes an MCP server, so any agent that already speaks MCP reads and writes against
            it without a bespoke SDK.
          </p>
          <p>
            Manifold, a version of the same engine for latent embeddings instead of text, exists as a design
            document and nothing else. It waits on a customer who needs multimodal memory.
          </p>
          <p>
            On 500 annotated coding-agent sessions, the write-gate approach catches contradictions an
            embedding-only baseline misses: 95% detection against 66%. It propagates a correction through dependent
            beliefs at 87% against 12% for an append-only store, and blocks 73% of contamination that an
            append-only store lets straight through. The gate costs latency, about 165ms added at the median, and
            only runs on the writes that are worth the wait.
          </p>
        </>
      ),
    },
    {
      id: 'the-wager',
      title: 'The wager',
      body: (
        <p>
          An agent that cannot separate what it observed from what it generated does not have beliefs. It has
          output with confidence attached. Engrammic gives it a way to answer three questions on demand: what does
          it know, what did it only generate, and which one does a given conclusion rest on.
        </p>
      ),
    },
  ],
}
