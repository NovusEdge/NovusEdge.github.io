import { Link, useParams } from 'react-router'
import { Meta } from '../../lib/meta'
import { getPaper } from '../../content/papers'
import { Markdown } from '../../components/markdown'
import { Rule, MonoTag } from '../../components/motifs'
import NotFound from '../not-found'

export default function PaperPage() {
  const { slug } = useParams()
  const paper = slug ? getPaper(slug) : undefined
  if (!paper) return <NotFound />

  return (
    <>
      <Meta title={paper.title} description={paper.abstract} />
      <article className="mx-auto max-w-2xl px-6 pb-24 pt-36">
        <Link to="/research" className="link-draw font-mono text-[11px] uppercase tracking-[0.25em] text-paper-deep dark:text-paper">
          ← research
        </Link>
        <h1 className="mt-6 font-display text-4xl font-black leading-tight">{paper.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <MonoTag>{paper.date}</MonoTag>
          <MonoTag>{paper.venue}</MonoTag>
          {paper.doi && (
            <a href={`https://doi.org/${paper.doi}`} className="link-draw font-mono text-[11px] uppercase tracking-[0.2em] text-paper-deep dark:text-paper">
              doi:{paper.doi} ↗
            </a>
          )}
        </div>
        <Rule className="mb-8 mt-6" />
        <p className="text-lg italic leading-relaxed text-charcoal/70 dark:text-bone/70">{paper.abstract}</p>
        <div className="mt-8">
          <Markdown>{paper.body}</Markdown>
        </div>
      </article>
    </>
  )
}
