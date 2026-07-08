import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

// hast -> plain text, just enough to sniff a leading marker
function nodeText(node: unknown): string {
  const n = node as { value?: string; children?: unknown[] } | null
  if (!n) return ''
  if (n.value) return n.value
  return (n.children ?? []).map(nodeText).join('')
}

// ponytail: one callout style (amber) keyed off a leading ⚠️ so it doesn't touch normal `>` quotes.
// Add more markers/colors when a post actually needs them.
const components: Components = {
  blockquote({ node, children, ...props }) {
    if (!nodeText(node).trimStart().startsWith('⚠️')) {
      return <blockquote {...props}>{children}</blockquote>
    }
    return (
      <blockquote
        {...props}
        className="not-italic rounded-md border-l-4 border-amber-500/70 bg-amber-500/10 px-4 py-3 text-sm font-medium text-charcoal/80 dark:text-bone/80 [&_p]:my-1 [&_p]:before:content-none [&_p]:after:content-none"
      >
        {children}
      </blockquote>
    )
  },
}

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-display prose-a:text-paper-deep prose-a:no-underline hover:prose-a:underline dark:prose-a:text-paper prose-code:font-mono prose-img:rounded-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
