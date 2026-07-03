import { Link, useParams } from 'react-router'
import { Meta } from '../../lib/meta'
import { getProject } from '../../content/projects'
import { Markdown } from '../../components/markdown'
import { Rule, MonoTag, JPLabel } from '../../components/motifs'
import NotFound from '../not-found'

export default function ProjectPage() {
  const { slug } = useParams()
  const project = slug ? getProject(slug) : undefined
  if (!project) return <NotFound />

  return (
    <>
      <Meta title={project.title} description={project.description} />
      <article className="relative mx-auto max-w-2xl px-6 pb-24 pt-36">
        {project.jp && <JPLabel className="absolute -left-2 top-40 hidden lg:block">{project.jp}</JPLabel>}
        <Link to="/portfolio" className="link-draw font-mono text-[11px] uppercase tracking-[0.25em] text-paper-deep dark:text-paper">
          ← portfolio
        </Link>
        <h1 className="mt-6 font-display text-5xl font-black">{project.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <MonoTag>{project.year}</MonoTag>
          {project.tech.map((t) => (
            <MonoTag key={t}>{t}</MonoTag>
          ))}
        </div>
        <div className="mt-4 flex gap-6">
          {project.links.map((l) => (
            <a key={l.href} href={l.href} className="link-draw font-mono text-xs uppercase tracking-[0.2em] text-paper-deep dark:text-paper">
              {l.label} ↗
            </a>
          ))}
        </div>
        <Rule className="mb-10 mt-6" />
        <p className="text-lg leading-relaxed text-charcoal/80 dark:text-bone/80">{project.description}</p>
        <div className="mt-8">
          <Markdown>{project.body}</Markdown>
        </div>
      </article>
    </>
  )
}
