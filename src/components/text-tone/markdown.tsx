import { Children, type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { withSlash } from '../../i18n/paths'
import { headingId } from '../../lib/blog-headings'

const PLACEHOLDER = /^\{\{(\w+)\}\}$/
const ARABIC = /[؀-ۿ]/
// Han plus the fullwidth comma inside the poem line.
const RUNS = { all: /([؀-ۿ]+|[㐀-鿿，]+)/, arabic: /([؀-ۿ]+)/ }

// zh and ja set their whole body in Han, so only other locales mark Han runs; Arabic is marked everywhere.
function markScripts(children: ReactNode, han: boolean): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child !== 'string') return child
    return child.split(han ? RUNS.all : RUNS.arabic).map((part, i) =>
      i % 2 === 0 ? part : ARABIC.test(part) ? (
        <span key={i} lang="ar" dir="rtl">{part}</span>
      ) : (
        <span key={i} lang="zh-Hans">{part}</span>
      ),
    )
  })
}

export function TextToneMarkdown({ children, figures, locale }: { children: string; figures: Record<string, ReactNode>; locale: string }) {
  const han = locale !== 'zh' && locale !== 'ja'
  const components: Components = {
    p({ node, children: kids }) {
      const first = node?.children.length === 1 ? node.children[0] : undefined
      const name = first?.type === 'text' ? PLACEHOLDER.exec(first.value.trim())?.[1] : undefined
      if (name && name in figures) return <>{figures[name]}</>
      return <p>{markScripts(kids, han)}</p>
    },
    a({ href, children: kids }) {
      if (href === '#stat') return <span className="tt-n">{kids}</span>
      return <a href={href && withSlash(href)}>{kids}</a>
    },
    h2({ children: kids }) {
      return <h2 id={headingId(String(kids))}>{kids}</h2>
    },
  }
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  )
}
