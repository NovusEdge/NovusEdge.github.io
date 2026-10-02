import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { blogHeadings, headingId } from '../../lib/blog-headings'
import { MEANING_POSTS, voiceMeta, type Doodle, type DoodleKind } from '../../lib/meaning-data'
import { nodeText, voicesFromNode } from '../../lib/meaning-voices'
import { rehypeMargin } from '../../lib/meaning-margin'
import { Drawn } from './drawn'
import { Jostle, Reveal } from './inline'
import { PenText } from './pen'
import { Voices } from './voices'

const DOODLE_KINDS = new Set<DoodleKind>(['question', 'spiral', 'arrow', 'star', 'cycle'])

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
    // Links to these fragments are effect markers, not links. They survive translation
    // because the translator keeps link targets, unlike a list of English anchor texts.
    a({ href, children: kids, node, ...props }) {
      const seed = node?.position?.start.offset
      if (href === '#ring') {
        return (
          <span className="ms-ring">
            {kids}
            <Drawn kind="ring" accent seed={seed} />
          </span>
        )
      }
      if (href === '#hand') return <Reveal className="ms-hand">{kids}</Reveal>
      if (href === '#smudge') return <Reveal className="ms-smudge">{kids}</Reveal>
      if (href === '#jostle') return <Jostle seed={seed ?? 1}>{kids}</Jostle>
      if (href === '#pen') return <PenText text={nodeText(node)} lineHeight={1.3} className="ms-pen-block" />
      const doodle = href?.match(/^#doodle-(\w+)-(left|right)$/)
      if (doodle) {
        const kind = doodle[1] as DoodleKind
        return DOODLE_KINDS.has(kind) ? <Drawn kind={kind} seed={seed} className={`ms-doodle ms-doodle-${doodle[2]}`} /> : <>{kids}</>
      }
      const external = !!href && /^https?:\/\//.test(href)
      return (
        <a href={href} {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})} {...props}>
          {kids}
        </a>
      )
    },
    del({ children: kids, node }) {
      return (
        <span className="ms-strike">
          <del>{kids}</del>
          <Drawn kind="strike" seed={node?.position?.start.offset} delay={700} />
        </span>
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
      if (!lines)
        return (
          <blockquote className="ms-quote" {...props}>
            <Drawn kind="quote" accent seed={node?.position?.start.offset} />
            {kids}
          </blockquote>
        )
      return <Voices lines={lines} meta={lines.map((_, i) => voiceMeta(slug, i, lines.length))} locale={locale} />
    },
  }

  return (
    <div className="ms-col ms-prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeMargin]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
