import {PortableText, slugify} from '../components/PortableText'
import {blockText, clean, isPlaceholder} from '../lib/content'

function visibleBlocks(body: any[] | undefined) {
  return (body || []).filter((b) => {
    const t = blockText(b)
    return t.trim() && !isPlaceholder(t)
  })
}

export function About({page}: {page: any}) {
  const intro = visibleBlocks(page.body)
  const sections = (page.sections || []).filter((s: any) => clean(s.heading) && visibleBlocks(s.body).length)
  return (
    <div className="container page">
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <ol>
          <li><a href="/">Home</a></li>
          <li><a href="/about/" aria-current="page">{page.title}</a></li>
        </ol>
      </nav>
      <article className="post">
        <header className="post__head"><h1>{page.title}</h1></header>
        {intro.length > 0 && <div className="prose"><PortableText value={page.body} /></div>}
        {sections.map((s: any) => {
          const id = s.anchor || slugify(s.heading)
          return (
            <section key={s._key || id} className="about-section" aria-labelledby={id}>
              <h2 id={id}>{s.heading}</h2>
              <div className="prose"><PortableText value={s.body} /></div>
            </section>
          )
        })}
      </article>
    </div>
  )
}
