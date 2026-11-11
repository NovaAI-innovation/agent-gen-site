import {renderToStaticMarkup} from 'react-dom/server'
import type {ReactNode} from 'react'
import {Layout} from './components/Layout'
import {Home} from './pages/Home'
import {NotesIndex} from './pages/Notes'
import {Post} from './pages/Post'
import {About} from './pages/About'
import {NotFound} from './pages/NotFound'
import {site, type SiteEnv} from './site.config'
import {clean, noteUrl} from './lib/content'

export interface PageOut { path: string; file: string; html: string; head: string; graph: boolean; code: boolean; inSitemap: boolean; lastmod?: string }

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function lastmodOf(doc?: {publishedAt?: string; updatedAt?: string; _updatedAt?: string} | null) {
  const raw = doc?.publishedAt || doc?.updatedAt || doc?._updatedAt
  if (!raw) return undefined
  const t = Date.parse(raw)
  if (Number.isNaN(t)) return undefined
  return new Date(t).toISOString().slice(0, 10)
}

function head(opts: {env: SiteEnv; title: string; description: string; path: string; ogTitle?: string; ogDescription?: string; ogType?: string; noIndex?: boolean; jsonLd?: object; siteName: string; locale: string; includeUrl?: boolean}) {
  const canonical = site.productionUrl + opts.path
  const robots = opts.env === 'preview' || opts.noIndex ? 'noindex,nofollow' : 'index,follow'
  const og = opts.locale.replace('-', '_')
  const tags = [
    `<title>${esc(opts.title)}</title>`,
    `<meta name="description" content="${esc(opts.description)}">`,
    `<meta name="robots" content="${robots}">`,
  ]
  if (opts.includeUrl !== false) tags.push(`<link rel="canonical" href="${canonical}">`)
  tags.push(
    `<meta property="og:type" content="${opts.ogType || 'website'}">`,
    `<meta property="og:site_name" content="${esc(opts.siteName)}">`,
    `<meta property="og:locale" content="${og}">`,
  )
  if (opts.includeUrl !== false) tags.push(`<meta property="og:url" content="${canonical}">`)
  tags.push(
    `<meta property="og:title" content="${esc(opts.ogTitle || opts.title)}">`,
    `<meta property="og:description" content="${esc(opts.ogDescription || opts.description)}">`,
    `<meta property="og:image" content="${site.productionUrl}${site.og.path}">`,
    `<meta property="og:image:width" content="${site.og.width}">`,
    `<meta property="og:image:height" content="${site.og.height}">`,
    `<meta property="og:image:type" content="${site.og.type}">`,
    `<meta property="og:image:alt" content="${esc(site.og.alt)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
  )
  if (opts.jsonLd) tags.push(`<script type="application/ld+json">${JSON.stringify(opts.jsonLd).replace(/</g, '\\u003c')}</script>`)
  return tags.join('\n')
}

export function buildPages(content: any, env: SiteEnv): {pages: PageOut[]; lang: string} {
  const {settings, home, posts, about} = content
  const year = new Date().getFullYear()
  const lang = clean(settings.locale) || site.locale
  const siteName = clean(settings.siteTitle) || 'agent-gen'
  const def = settings.defaultSeo || {}
  const wrap = (path: string, node: ReactNode) => renderToStaticMarkup(<Layout settings={settings} path={path} year={year}>{node}</Layout>)
  const base = {env, siteName, locale: lang}
  const website = {'@type': 'WebSite', '@id': `${site.productionUrl}/#website`, url: `${site.productionUrl}/`, name: siteName, description: clean(settings.description), inLanguage: lang}
  const crumbs = (items: [string, string][]) => ({'@type': 'BreadcrumbList', itemListElement: items.map(([name, p], i) => ({'@type': 'ListItem', position: i + 1, name, item: site.productionUrl + p}))})

  const pages: PageOut[] = []
  const hs = home.seo || def
  pages.push({
    path: '/', file: 'index.html', graph: true, code: false, inSitemap: true, lastmod: lastmodOf(home),
    html: wrap('/', <Home content={content} />),
    head: head({...base, path: '/', title: hs.metaTitle || siteName, description: hs.metaDescription || def.metaDescription, ogTitle: hs.ogTitle, ogDescription: hs.ogDescription, noIndex: hs.noIndex,
      jsonLd: {'@context': 'https://schema.org', '@graph': [website, {'@type': 'WebPage', '@id': `${site.productionUrl}/#webpage`, url: `${site.productionUrl}/`, name: hs.metaTitle, isPartOf: {'@id': `${site.productionUrl}/#website`}}]}}),
  })

  pages.push({
    path: '/notes/', file: 'notes/index.html', graph: false, code: false, inSitemap: true,
    html: wrap('/notes/', <NotesIndex content={content} />),
    head: head({...base, path: '/notes/', title: `Notes · ${siteName}`, description: 'Short posts on how AI agents work and what we learn while building them.',
      jsonLd: {'@context': 'https://schema.org', '@graph': [{'@type': 'CollectionPage', name: 'Notes', url: `${site.productionUrl}/notes/`, isPartOf: {'@id': `${site.productionUrl}/#website`}}, crumbs([['Home', '/'], ['Notes', '/notes/']])]}}),
  })

  posts.forEach((p: any, i: number) => {
    const path = noteUrl(p.slug)
    const s = p.seo || {}
    const hasCode = (p.body || []).some((b: any) => b._type === 'codeBlock')
    const posting: any = {'@type': 'BlogPosting', headline: p.title, description: clean(p.summary), url: site.productionUrl + path, inLanguage: lang, isPartOf: {'@id': `${site.productionUrl}/#website`}}
    if (p.publishedAt) posting.datePublished = p.publishedAt
    if (p.updatedAt || p.publishedAt) posting.dateModified = p.updatedAt || p.publishedAt
    if (clean(p.authorName)) posting.author = {'@type': 'Organization', name: p.authorName}
    pages.push({
      path, file: `notes/${p.slug}/index.html`, graph: false, code: hasCode, inSitemap: true, lastmod: lastmodOf(p),
      html: wrap(path, <Post post={p} prev={posts[i + 1]} next={posts[i - 1]} />),
      head: head({...base, path, title: s.metaTitle || p.title, description: s.metaDescription || p.summary, ogTitle: s.ogTitle, ogDescription: s.ogDescription, ogType: 'article', noIndex: s.noIndex,
        jsonLd: {'@context': 'https://schema.org', '@graph': [posting, crumbs([['Home', '/'], ['Notes', '/notes/'], [p.title, path]])]}}),
    })
  })

  if (about) {
    const s = about.seo || {}
    pages.push({
      path: '/about/', file: 'about/index.html', graph: false, code: false, inSitemap: true, lastmod: lastmodOf(about),
      html: wrap('/about/', <About page={about} />),
      head: head({...base, path: '/about/', title: s.metaTitle || `About · ${siteName}`, description: s.metaDescription || def.metaDescription, noIndex: s.noIndex,
        jsonLd: {'@context': 'https://schema.org', '@graph': [{'@type': 'AboutPage', name: about.title, url: `${site.productionUrl}/about/`, isPartOf: {'@id': `${site.productionUrl}/#website`}}, crumbs([['Home', '/'], ['About', '/about/']])]}}),
    })
  }

  pages.push({
    path: '/404', file: '404.html', graph: false, code: false, inSitemap: false,
    html: wrap('/404', <NotFound />),
    head: head({...base, path: '/404', title: `Page not found · ${siteName}`, description: 'This page could not be found.', noIndex: true, includeUrl: false}),
  })
  return {pages, lang}
}
