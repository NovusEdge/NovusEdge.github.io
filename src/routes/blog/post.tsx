import { Meta } from '../../lib/meta'
import { Markdown } from '../../components/markdown'
import { getPost } from '../../lib/posts'

export default function BlogPost() {
  return (
    <>
      <Meta title="Post" />
      <div className="px-6 pt-40">
        <Markdown>{getPost('hello-vite')?.content ?? 'missing'}</Markdown>
      </div>
    </>
  )
}
