import {clean, noteUrl} from '../lib/content'

export function Tags({tags}: {tags?: string[]}) {
  const list = (tags || []).filter((t) => clean(t))
  if (!list.length) return null
  return (
    <ul className="tags" aria-label="Tags">
      {list.map((t) => <li key={t} className="tag">{t}</li>)}
    </ul>
  )
}

export function formatDate(iso?: string) {
  if (!iso) return undefined
  return new Date(iso).toLocaleDateString('en-CA', {year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'})
}

export function PostCard({post, headingLevel = 2}: {post: any; headingLevel?: 2 | 3}) {
  const H = headingLevel === 2 ? 'h2' : 'h3'
  const date = formatDate(post.publishedAt)
  return (
    <article className="card">
      <H className="card__title"><a href={noteUrl(post.slug)}>{post.title}</a></H>
      {clean(post.summary) && <p className="card__summary">{post.summary}</p>}
      <div className="card__meta">
        {date && <time dateTime={post.publishedAt}>{date}</time>}
        <Tags tags={post.tags} />
      </div>
    </article>
  )
}
