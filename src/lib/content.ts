// Helpers that enforce the frontend content rules.
import {site} from '../site.config'

/** Unfilled copy placeholders must never render. */
const PLACEHOLDER = /\[\[\s*SLOT\s*:|\[TEAM NAME\]/i
export const isPlaceholder = (s?: string | null) => !!s && PLACEHOLDER.test(s)
/** Returns the string only if it is non-empty and not a placeholder. */
export const clean = (s?: string | null): string | undefined => (s && s.trim() && !isPlaceholder(s) ? s : undefined)

/** GitHub links render only when the single config value AND Sanity both allow it. Day 1: never. */
export function githubOrgUrl(settings: any): string | undefined {
  if (!site.githubOrg) return undefined
  const gh = settings?.github
  if (!gh?.linksEnabled || !gh?.orgUrl) return undefined
  return gh.orgUrl
}

const GITHUB = /github\.com/i
/** Normalise an href: internal paths get a trailing slash; github links are dropped while githubOrg is null. */
export function safeHref(href?: string): string | undefined {
  if (!href) return undefined
  if (GITHUB.test(href) && !site.githubOrg) return undefined
  if (href.startsWith('/') && !href.includes('#') && !/\.[a-z0-9]+$/i.test(href) && !href.endsWith('/')) return href + '/'
  return href
}

export const isExternal = (href: string) => /^https?:\/\//i.test(href)

export const noteUrl = (slug: string) => `/notes/${slug}/`

export function blockText(block: any): string {
  if (block?._type === 'block') return (block.children || []).map((c: any) => c.text || '').join('')
  if (block?._type === 'callout') return block.body || ''
  if (block?._type === 'codeBlock') return block.code || ''
  if (block?._type === 'figure') return `${block.alt || ''} ${block.caption || ''}`
  return ''
}

/** About section whose voice is Casey ("I"). Used to attribute owner-voice items, with no name on the page. */
export function ownerAttribution(about?: any): {label: string; href: string} | undefined {
  const section = (about?.sections || []).find((s: any) => s?.voice === 'owner')
  const label = clean(section?.heading)
  if (!label) return undefined
  const raw = (typeof section.anchor === 'string' && section.anchor.trim())
    ? section.anchor.trim()
    : label.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return {label, href: raw ? `/about/#${raw}` : '/about/'}
}

export const isOwnerVoice = (voice?: string | null) => voice === 'owner'

/** User-facing name for the /notes/ collection. Routes and field names stay "notes". */
export const BLOG_LABEL = 'Blog'

/** Blog index title, lede and meta from Sanity when Content provides them. */
export function blogIndex(content?: any): {title: string; lede?: string; metaTitle?: string; metaDescription?: string} {
  const idx = content?.notesPage || content?.settings?.blogIndex || content?.blogIndex
  const title = clean(idx?.title) || BLOG_LABEL
  const fromBody = Array.isArray(idx?.body)
    ? clean((idx.body as any[]).map(blockText).join(' ').replace(/\s+/g, ' '))
    : undefined
  const lede = clean(idx?.lede) || clean(idx?.intro) || fromBody
  const metaTitle = clean(idx?.seo?.metaTitle) || clean(idx?.metaTitle)
  const metaDescription = clean(idx?.seo?.metaDescription) || clean(idx?.metaDescription) || lede
  return {title, lede, metaTitle, metaDescription}
}

/** 404 heading, lede and home-button label from Sanity, with neutral fallbacks. */
export function notFoundCopy(content?: any): {heading: string; lede: string; homeLabel: string} {
  const n = content?.settings?.notFound || content?.notFound
  return {
    heading: clean(n?.heading) || 'This page isn’t here',
    lede: clean(n?.lede) || 'The link may be old or mistyped.',
    homeLabel: clean(n?.homeLabel) || 'Go to the home page',
  }
}
