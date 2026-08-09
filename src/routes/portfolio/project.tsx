import { useParams } from 'react-router'
import { Meta } from '../../lib/meta'
import { getProject } from '../../content/projects'
import { PROJECT_PAGES } from './content'
import { Dossier } from './layouts'
import NotFound from '../not-found'

export default function ProjectPage() {
  const { slug } = useParams()
  const p = slug ? getProject(slug) : undefined
  const c = slug ? PROJECT_PAGES[slug] : undefined

  // A project without written content has no page, even though its card exists.
  if (!p || !c) return <NotFound />

  return (
    <>
      <Meta title={p.title} description={p.description} />
      <Dossier p={p} c={c} />
    </>
  )
}
