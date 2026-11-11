import {PostCard} from './shared'

export function NotesIndex({content}: {content: any}) {
  const posts = content.posts
  return (
    <div className="container page">
      <header className="page__head">
        <h1>Notes</h1>
        <p className="lede">Short posts on how agents work and what we learn while building them.</p>
      </header>
      {posts.length ? (
        <ul className="note-list" role="list">
          {posts.map((p: any) => <li key={p.slug}><PostCard post={p} headingLevel={2} /></li>)}
        </ul>
      ) : (
        <p>{content.home?.latestNotes?.emptyText || 'The first notes are on the way.'}</p>
      )}
    </div>
  )
}
