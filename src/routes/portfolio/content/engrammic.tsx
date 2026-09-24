import type { ProjectContent } from './types'

export const engrammic: ProjectContent = {
  lede: 'Structured memory for agents, with evidence attached to claims and a graph that records how those claims change.',
  sections: [
    {
      id: 'no-referee',
      title: 'Conflicting records',
      body: <p>An agent can store two incompatible statements about an API and later retrieve either one. Engrammic records the evidence, relevant time, and revisions so the agent can inspect which statement applies.</p>,
    },
    {
      id: 'claim-to-fact',
      title: 'From claim to fact',
      body: <p>Observations, claims, facts, and beliefs have distinct record types. Promotion rules use confidence and corroboration. Supersession links a revised record to the earlier one without deleting the history. These rules organise evidence; they do not guarantee that a claim is true.</p>,
    },
    {
      id: 'the-3-6-bit-ceiling',
      title: 'Why use an external store',
      body: <p>An external store lets an application inspect and revise individual claims without retraining a model. Each record has an identifier and can link to its evidence and earlier versions.</p>,
    },
    {
      id: 'primitives-engine-mcp',
      title: 'Packages',
      body: <p><code>engrammic-primitives</code> defines the schema and promotion rules under Apache 2.0. The backend exposes memory operations through MCP. Manifold explores a version for latent embeddings.</p>,
    },
    {
      id: 'the-wager',
      title: 'Evaluation',
      body: <p>The evaluation questions are whether the system detects contradictions, carries corrections into dependent work, and adds acceptable latency. The <a href="https://engrammic.ai/research">research page</a> describes the approach.</p>,
    },
  ],
}
