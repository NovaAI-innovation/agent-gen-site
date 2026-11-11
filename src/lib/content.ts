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
