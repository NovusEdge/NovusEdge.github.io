export type Paper = {
  slug: string
  title: string
  venue: string
  date: string
  abstract: string
  links: { label: string; href: string }[]
}

// Real papers from Engrammic Labs (engrammic.ai/research). Cards link out to the
// papers themselves; there is no in-site detail page (see App.tsx / vite.config.ts).
export const papers: Paper[] = [
  {
    slug: 'beyond-retrieval',
    title: 'Beyond Retrieval: LeAP for Coherent Long-Term Agentic Memory',
    venue: 'Preprint · Zenodo',
    date: '2026',
    abstract:
      "An agent that stores a fact on Monday and a contradicting update on Tuesday retrieves both with equal confidence, because a similarity-ranked store has no concept of supersession. This paper argues that memory for long-running agents is an epistemology problem, not a retrieval problem, and introduces Epistemic Augmented Generation (EAG): stratified belief types, evidence requirements, and provenance chains that enforce coherence at write time instead of hoping for it at read time. The resulting CITE architecture is evaluated across 500 agent sessions, reaching 95% contradiction detection against a 66% baseline and 87% revision propagation against 12%.",
    links: [
      { label: 'engrammic.ai', href: 'https://engrammic.ai/beyond-retrieval' },
      { label: 'zenodo', href: 'https://zenodo.org/records/21029662' },
    ],
  },
  {
    slug: 'from-memory-to-epistemics',
    title: 'From Memory to Epistemics',
    venue: 'Preprint (forthcoming)',
    date: '2026',
    abstract:
      "Where should an agent's knowledge live: in the weights, in the context window, or in an external store? This paper argues externalization is not optional but architecturally required, drawing convergent evidence from information theory, optimization, interpretability, distributed systems, and neuroscience. In-weights knowledge fails on capacity and auditability, session context fails on persistence, and per-agent learned state fails on coordination, leaving external epistemic state as what remains. The paper makes that case and sketches the structure such a store needs.",
    links: [
      { label: 'engrammic.ai', href: 'https://engrammic.ai/from-memory-to-epistemics' },
      { label: 'research repo', href: 'https://github.com/engrammic-ai/research' },
    ],
  },
]
