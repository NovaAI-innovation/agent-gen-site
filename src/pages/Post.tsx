import {PortableText} from '../components/PortableText'
import {clean, noteUrl} from '../lib/content'
import {Tags, formatDate} from './shared'

export function Post({post, prev, next}: {post: any; prev?: any; next?: any}) {
  const date = formatDate(post.publishedAt)
  const updated = formatDate(post.updatedAt)
  const author = clean(post.authorName)
  return (
    <div className="container page">
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <ol>
          <li><a href="/">Home</a></li>
          <li><a href="/notes/">Notes</a></li>
          <li><a href={noteUrl(post.slug)} aria-current="page">{post.title}</a></li>
        </ol>
      </nav>
      <article className="post">
        <header className="post__head">
          <h1>{post.title}</h1>
          {clean(post.summary) && <p className="lede">{post.summary}</p>}
          {(date || updated || author || post.tags?.length) && (
            <div className="post__meta">
              {author && <span>By {author}</span>}
              {date && <time dateTime={post.publishedAt}>{date}</time>}
              {updated && <span>Updated <time dateTime={post.updatedAt}>{updated}</time></span>}
              <Tags tags={post.tags} />
            </div>
          )}
        </header>
        <div className="prose">
          <PortableText value={post.body} />
        </div>
      </article>
      <nav aria-label="More notes" className="prevnext">
        <ul role="list">
          <li>{prev && <a href={noteUrl(prev.slug)} rel="prev"><span className="prevnext__dir">Previous note</span><span className="prevnext__title">{prev.title}</span></a>}</li>
          <li>{next && <a href={noteUrl(next.slug)} rel="next"><span className="prevnext__dir">Next note</span><span className="prevnext__title">{next.title}</span></a>}</li>
        </ul>
        <p className="prevnext__home"><a href="/notes/">All notes</a> · <a href="/">Home</a></p>
      </nav>
    </div>
  )
}
