import { Link, useParams } from 'react-router'
import { Meta } from '../../lib/meta'
import { getPost } from '../../lib/posts'
import { Markdown } from '../../components/markdown'
import { Rule, MonoTag } from '../../components/motifs'
import NotFound from '../not-found'

export default function BlogPost() {
  const { slug } = useParams()
  const post = slug ? getPost(slug) : undefined
  if (!post) return <NotFound />

  return (
    <>
      <Meta title={post.title} description={post.description || post.title} />
      <article className="mx-auto max-w-2xl px-6 pb-24 pt-36">
        <Link to="/blog" className="link-draw font-mono text-[11px] uppercase tracking-[0.25em] text-paper-deep dark:text-paper">
          ← blog
        </Link>
        <h1 className="mt-6 font-display text-4xl font-black leading-tight md:text-5xl">{post.title}</h1>
        <div className="mt-4 flex items-center gap-4">
          <MonoTag>{post.date}</MonoTag>
          {post.tags.map((t) => (
            <MonoTag key={t}>{t}</MonoTag>
          ))}
        </div>
        <Rule className="mb-10 mt-6" />
        <Markdown>{post.content}</Markdown>
      </article>
    </>
  )
}
