export type Paper = {
  slug: string
  title: string
  venue: string
  date: string
  doi?: string
  abstract: string
  body: string
}

// ponytail: placeholder — real papers get pulled from engrammic.ai/research (spec: external content, Phase 6)
export const papers: Paper[] = [
  {
    slug: 'placeholder-paper',
    title: 'Placeholder Paper Title',
    venue: 'Preprint',
    date: '2026-01-01',
    doi: undefined,
    abstract: 'Placeholder abstract — replaced during content migration with papers from engrammic.ai/research.',
    body: 'Full paper page content coming with content migration.',
  },
]

export const getPaper = (slug: string) => papers.find((p) => p.slug === slug)
