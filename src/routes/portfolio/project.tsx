import { useParams } from 'react-router'
import { Meta } from '../../lib/meta'
import { getProject } from '../../content/projects'
import { PROJECT_PAGES } from './content'
import { Dossier } from './layouts'
import { CUSTOM_PAGES } from './custom-pages'
import NotFound from '../not-found'
import { useLocale } from '../../i18n/context'

export default function ProjectPage() {
  const { slug } = useParams()
  const p = slug ? getProject(slug) : undefined
  const c = slug ? PROJECT_PAGES[slug] : undefined
  const locale = useLocale()

  // A project without written content has no page, even though its card exists.
  if (!p || !c) return <NotFound />

  // Fully custom layouts take over per slug; the rest fall back to the dossier.
  const Custom = slug ? CUSTOM_PAGES[slug] : undefined

  return (
    <>
      <Meta title={p.title} description={p.description} />
      {Custom ? (
        // Case-study prose stays English by design; mark it so non-English locales don't read it phonetically.
        <div lang={locale.default ? undefined : 'en'}>
          <Custom p={p} c={c} />
        </div>
      ) : (
        <Dossier p={p} c={c} />
      )}
    </>
  )
}
