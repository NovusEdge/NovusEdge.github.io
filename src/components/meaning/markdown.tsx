import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { blogHeadings, headingId } from '../../lib/blog-headings'
import { MEANING_POSTS, voiceMeta, type Doodle } from '../../lib/meaning-data'
import { voicesFromNode } from '../../lib/meaning-voices'
import { Drawn } from './drawn'
import { Voices } from './voices'

// Blocks a doodle cannot sit in: headings, quotes, lists, tables, fences, rules.
const NOT_PARAGRAPH = /^(#|>|[-*+] |\d+\. |\||```|---)/

export function doodleLines(markdown: string, slug: string, doodles: Doodle[]) {
  const lines = markdown.split('\n')
  const heads = blogHeadings(markdown, slug)
  const out = new Map<number, Doodle>()
  for (const d of doodles) {
    const head = heads.find((h) => h.id === d.after)
    if (!head) continue
    for (let i = head.line; i < lines.length; i++) {
      const text = lines[i].trim()
      if (!text) continue
      if (text.startsWith('## ')) break
      // A quote or list counts as its own block; skip past it to the next paragraph.
      if (NOT_PARAGRAPH.test(text)) continue
      out.set(i + 1, d)
      break
    }
  }
  return out
}

export function MeaningMarkdown({ slug, locale, children }: { slug: string; locale: string; children: string }) {
  const ids = new Map(blogHeadings(children, slug).map((h) => [h.line, h.id]))
  const doodles = doodleLines(children, slug, MEANING_POSTS[slug]?.doodles ?? [])

  const components: Components = {
    h2({ node, children: kids, ...props }) {
      const line = node?.position?.start.line ?? 0
      return (
        <h2 id={ids.get(line) ?? headingId(String(kids))} {...props}>
          {kids}
          <Drawn kind="underline" seed={line} />
        </h2>
      )
    },
    p({ node, children: kids, ...props }) {
      const d = doodles.get(node?.position?.start.line ?? 0)
      return (
        <p {...props}>
          {d && <Drawn kind={d.kind} seed={node?.position?.start.line} className={`ms-doodle ms-doodle-${d.side}`} />}
          {kids}
        </p>
      )
    },
    a({ href, children: kids, node, ...props }) {
      if (href === '#ring') {
        return (
          <span className="ms-ring">
            {kids}
            <Drawn kind="ring" accent seed={node?.position?.start.offset} />
          </span>
        )
      }
      const external = !!href && /^https?:\/\//.test(href)
      return (
        <a href={href} {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})} {...props}>
          {kids}
        </a>
      )
    },
    hr() {
      return (
        <div className="ms-divider" aria-hidden="true">
          <Drawn kind="squiggle" />
        </div>
      )
    },
    blockquote({ node, children: kids, ...props }) {
      const lines = voicesFromNode(node)
      if (!lines) return <blockquote {...props}>{kids}</blockquote>
      return <Voices lines={lines} meta={lines.map((_, i) => voiceMeta(slug, i, lines.length))} locale={locale} />
    },
  }

  return (
    <div className="ms-col ms-prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
