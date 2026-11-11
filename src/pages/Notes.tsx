import {PostCard} from './shared'
import {blogIndex, clean} from '../lib/content'

export function NotesIndex({content}: {content: any}) {
  const posts = content.posts
  const index = blogIndex(content)
  return (
    <div className="container page">
      <header className="page__head">
        <h1>{index.title}</h1>
        {index.lede && <p className="lede">{index.lede}</p>}
      </header>
      {posts.length ? (
        <ul className="note-list" role="list">
          {posts.map((p: any) => <li key={p.slug}><PostCard post={p} headingLevel={2} /></li>)}
        </ul>
      ) : (
        <p>{clean(content.home?.latestNotes?.emptyText) || 'Nothing here yet.'}</p>
      )}
    </div>
  )
}
