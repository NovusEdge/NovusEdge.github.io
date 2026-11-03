export type Paper = {
  slug: string
  title: string
  venue: string
  date: string
  abstract: string
  url: string // canonical link, where the paper was published (title + thumbnail point here)
  thumb?: string // optional cover image in /public/assets; falls back to a generated cover
  links: { label: string; href: string }[]
}

// Papers I've published, newest first. Cards link out to where each was published;
// there is no in-site detail page (see App.tsx / vite.config.ts).
export const papers: Paper[] = [
  {
    slug: 'where-should-elapsed-time-enter',
    title: 'Where Should Elapsed Time Enter a Pretrained Model?',
    venue: 'Preprint · Zenodo',
    date: '2026',
    url: 'https://zenodo.org/records/23921544',
    thumb: '/assets/elapsed-time.mp4',
    abstract:
      "LLM agents log what happens in a session but have no sense of how much time has passed; frameworks pass time in only as timestamps in the text. This paper sorts the ways elapsed time can enter a pretrained model into three levels: as written text, as a separate conditioning input, or as an argument to the operations that update and read the model's memory, which it calls chronoaware. Qwen3.5-2B is adapted eight ways at equal trainable parameters and tested against four pre-registered hypotheses on time-dependent agent decisions. Plain text with fine-tuning wins, only one hypothesis passes, and elapsed time turns out to be linearly decodable even from a shuffled-time control, so decodability alone does not show a learned clock.",
    links: [
      { label: 'zenodo', href: 'https://zenodo.org/records/23921544' },
      { label: 'doi', href: 'https://doi.org/10.5281/zenodo.23921544' },
      { label: 'hugging face', href: 'https://huggingface.co/NovusEdge/sundial-qwen3.5-2b-T-int' },
    ],
  },
  {
    slug: 'from-memory-to-epistemics',
    title: 'From Memory to Epistemics',
    venue: 'Preprint · Zenodo',
    date: '2026',
    url: 'https://zenodo.org/records/21071102',
    thumb: '/assets/memory-to-epistemics.mp4',
    abstract:
      "Where should an agent's knowledge live: in the weights, in the context window, or in an external store? This paper argues externalization is not optional but architecturally required, drawing convergent evidence from information theory, optimization, interpretability, distributed systems, and neuroscience. In-weights knowledge fails on capacity and auditability, session context fails on persistence, and per-agent learned state fails on coordination, leaving external epistemic state as what remains. The paper makes that case and sketches the structure such a store needs.",
    links: [
      { label: 'zenodo', href: 'https://zenodo.org/records/21071102' },
      { label: 'engrammic.ai', href: 'https://engrammic.ai/from-memory-to-epistemics' },
      { label: 'research repo', href: 'https://github.com/engrammic-ai/research' },
    ],
  },
  {
    slug: 'beyond-retrieval',
    title: 'Beyond Retrieval: LeAP for Coherent Long-Term Agentic Memory',
    venue: 'Preprint · Zenodo',
    date: '2026',
    url: 'https://zenodo.org/records/21029662',
    thumb: '/assets/beyond-retrieval.jpeg',
    abstract:
      "An agent that stores a fact on Monday and a contradicting update on Tuesday retrieves both with equal confidence, because a similarity-ranked store has no concept of supersession. This paper argues that memory for long-running agents is an epistemology problem, not a retrieval problem, and introduces Epistemic Augmented Generation (EAG): stratified belief types, evidence requirements, and provenance chains that enforce coherence at write time instead of hoping for it at read time. The resulting CITE architecture is evaluated across 500 agent sessions, reaching 95% contradiction detection against a 66% baseline and 87% revision propagation against 12%.",
    links: [
      { label: 'zenodo', href: 'https://zenodo.org/records/21029662' },
      { label: 'engrammic.ai', href: 'https://engrammic.ai/beyond-retrieval' },
    ],
  },
]
