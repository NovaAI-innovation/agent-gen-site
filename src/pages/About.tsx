import {PortableText} from '../components/PortableText'

export function About({page}: {page: any}) {
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
        <div className="prose"><PortableText value={page.body} /></div>
      </article>
    </div>
  )
}
