import type { Post } from './posts'
import type { Project } from '../content/projects'
import { SITE_NAME } from './meta'

const ORIGIN = 'https://khimani.dev'
const PERSON_ID = `${ORIGIN}/#person`
const WEBSITE_ID = `${ORIGIN}/#website`

// Profiles listed here are what Google uses to tie this site to the same
// person on other platforms; keep them in step with the contact card.
const PERSON = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'Aliasgar Khimani',
  alternateName: 'NovusEdge',
  url: `${ORIGIN}/`,
  email: 'mailto:khimanialiasgar@gmail.com',
  jobTitle: 'Systems Architect',
  description: 'Building cognitive infrastructure for AI agents',
  homeLocation: { '@type': 'Country', name: 'Finland' },
  knowsAbout: [
    'AI Agents', 'Epistemic Memory', 'Agent Evals', 'LLM-as-Judge',
    'Benchmark Design', 'Failure Mode Analysis', 'Production Monitoring',
    'TypeScript', 'Python', 'Rust', 'Go', 'C',
    'MCP', 'Docker', 'Redis', 'Memgraph', 'Qdrant', 'Neo4j',
    'React', 'WebGL', 'QEMU', 'KVM', 'ESP32', 'RF',
    'Privacy Infrastructure', 'Offensive Security', 'Distributed Systems',
    'Multi-Agent Systems', 'Knowledge Graphs', 'Provenance Tracking',
  ],
  sameAs: [
    'https://github.com/NovusEdge',
    'https://github.com/engrammic-ai',
    'https://www.linkedin.com/in/aliasgarkhimani/',
    'https://x.com/0kaliasgar',
    'https://huggingface.co/NovusEdge',
    'https://ko-fi.com/aliasgarkhimani',
  ],
  worksFor: { '@type': 'Organization', name: 'Engrammic', url: 'https://engrammic.ai' },
}

const SECTIONS: Record<string, string> = {
  about: 'About',
  blog: 'Blog',
  blips: 'Blips',
  portfolio: 'Portfolio',
  research: 'Research',
  stack: 'Stack',
}

type PageInput = {
  canonical: string
  // locale-stripped, no trailing slash, '/' for home
  path: string
  // '' for English, '/fi' etc. when the canonical page is a translation
  localePrefix: string
  title: string
  pageTitle: string | null
  description: string
  image: string | null
  inLanguage: string
  post?: Post
  project?: Project
  // every portfolio card, listed on /portfolio
  projects?: Project[]
}

function software(project: Project) {
  const repo = project.links.find((link) => link.href.startsWith('https://github.com/'))?.href
  // Upstream projects he contributed to are credited as contributor, not author.
  const credit = project.group === 'oss' ? 'contributor' : 'author'
  return {
    '@type': 'SoftwareSourceCode',
    name: project.title,
    description: project.description,
    [credit]: { '@id': PERSON_ID },
    ...(repo ? { codeRepository: repo } : {}),
    ...(project.lang ? { programmingLanguage: project.lang } : {}),
    ...(/^\d{4}$/.test(project.year) ? { dateCreated: project.year } : {}),
    ...(project.tech.length ? { keywords: project.tech } : {}),
    ...(project.image ? { image: `${ORIGIN}${project.image}` } : {}),
  }
}

export function structuredData(page: PageInput) {
  const pageId = `${page.canonical}#webpage`
  const image = page.image ? `${ORIGIN}${page.image}` : undefined
  const [section, child] = page.path.split('/').filter(Boolean)

  const crumbs = [{ name: SITE_NAME, url: `${ORIGIN}${page.localePrefix}/` }]
  if (section && SECTIONS[section]) crumbs.push({ name: SECTIONS[section], url: `${ORIGIN}${page.localePrefix}/${section}/` })
  if (child && page.pageTitle) crumbs.push({ name: page.pageTitle, url: page.canonical })

  const webPage: Record<string, unknown> = {
    '@type': section === 'about' ? 'ProfilePage' : !child && (section === 'blog' || section === 'portfolio') ? 'CollectionPage' : 'WebPage',
    '@id': pageId,
    url: page.canonical,
    name: page.title,
    description: page.description,
    inLanguage: page.inLanguage,
    isPartOf: { '@id': WEBSITE_ID },
    ...(image ? { primaryImageOfPage: { '@type': 'ImageObject', url: image } } : {}),
    ...(section === 'about' || page.path === '/' ? { mainEntity: { '@id': PERSON_ID } } : { about: { '@id': PERSON_ID } }),
    ...(crumbs.length > 1
      ? {
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: crumbs.map((crumb, i) => ({ '@type': 'ListItem', position: i + 1, name: crumb.name, item: crumb.url })),
          },
        }
      : {}),
  }

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: `${ORIGIN}/`,
      name: SITE_NAME,
      alternateName: ['NovusEdge', 'khimani.dev'],
      publisher: { '@id': PERSON_ID },
    },
    PERSON,
    webPage,
  ]

  if (page.post) {
    const { post } = page
    const published = new Date(post.date).toISOString()
    graph.push({
      '@type': 'BlogPosting',
      '@id': `${page.canonical}#article`,
      headline: post.title,
      description: post.description || undefined,
      datePublished: published,
      dateModified: published,
      url: page.canonical,
      mainEntityOfPage: { '@id': pageId },
      isPartOf: { '@id': WEBSITE_ID },
      inLanguage: page.inLanguage,
      author: { '@id': PERSON_ID },
      publisher: { '@id': PERSON_ID },
      ...(post.tags.length ? { keywords: post.tags } : {}),
      ...(image ? { image } : {}),
    })
  }

  if (page.project) {
    graph.push({ ...software(page.project), '@id': `${page.canonical}#software`, url: page.canonical, mainEntityOfPage: { '@id': pageId } })
  }

  if (page.path === '/portfolio' && page.projects) {
    webPage.mainEntity = {
      '@type': 'ItemList',
      itemListElement: page.projects.map((project, i) => ({ '@type': 'ListItem', position: i + 1, item: software(project) })),
    }
  }

  // '<' escaped so a title containing </script> cannot close the tag early.
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')
}
