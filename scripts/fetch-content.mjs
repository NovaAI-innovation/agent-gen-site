// Fetch day-1 content from Sanity at build time (server-side only).
// The read token is loaded from an env file into process.env for this process only;
// it is never written to disk, logged, or passed to the client bundle.
import {createClient} from '@sanity/client'
import {readFileSync, existsSync, mkdirSync, writeFileSync} from 'node:fs'
import {loadEnv} from './load-env.mjs'

loadEnv()

const SITE_ENV = process.env.SITE_ENV === 'production' ? 'production' : 'preview'
const envFile = process.env.SANITY_ENV_FILE
if (!process.env.SANITY_READ_TOKEN && !envFile) {
  console.error('fetch-content: SANITY_READ_TOKEN or SANITY_ENV_FILE is not set. Copy .env.example to .env and fill in values.')
  process.exit(1)
}

function loadToken() {
  if (process.env.SANITY_READ_TOKEN) return process.env.SANITY_READ_TOKEN
  if (!envFile || !existsSync(envFile)) return undefined
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*SANITY_READ_TOKEN\s*=\s*"?([^"\n]+)"?\s*$/)
    if (m) return m[1].trim()
  }
  return undefined
}

const token = loadToken()
if (!token) {
  const where = process.env.SANITY_READ_TOKEN ? 'SANITY_READ_TOKEN' : (envFile ? 'SANITY_ENV_FILE (file missing or has no SANITY_READ_TOKEN)' : 'SANITY_READ_TOKEN or SANITY_ENV_FILE')
  console.error(`fetch-content: ${where} did not provide a token. Copy .env.example to .env and fill in values. The dataset is private; cannot build.`)
  process.exit(1)
}

const client = createClient({
  projectId: 'jqsksqmz',
  dataset: 'production',
  apiVersion: '2025-02-19',
  useCdn: false,
  token,
  // Preview shows drafts; production reads published only.
  perspective: SITE_ENV === 'production' ? 'published' : 'drafts',
})

const query = `{
  "settings": *[_id == "siteSettings"][0]{_updatedAt, siteTitle, tagline, description, siteUrl, locale, owner, github, mainNav, footer, defaultSeo, blogIndex, notFound},
  "home": *[_id == "homePage"][0]{_updatedAt, hero, purposeSections[]{..., "anchor": anchor.current, items[]{..., voice}}, contentSection{..., "anchor": anchor.current, cards[]{..., voice}}, latestNotes, comingSoonNotice, seo},
  "posts": *[_type == "post" && defined(slug.current)] | order(coalesce(publishedAt, _updatedAt) desc, title asc){
    _id, _updatedAt, title, "slug": slug.current, summary, publishedAt, updatedAt, tags, authorName, body, seo
  },
  "about": *[_type == "page" && slug.current == "about"][0]{_updatedAt, title, "slug": slug.current, publishedAt, updatedAt, body, seo, sections[]{heading, voice, "anchor": anchor.current, body}},
  "notesPage": *[_type == "page" && slug.current == "notes"][0]{_updatedAt, title, "slug": slug.current, body, seo}
}`

try {
  const data = await client.fetch(query)
  if (!data.settings || !data.home) throw new Error('siteSettings or homePage missing')
  mkdirSync('.content', {recursive: true})
  writeFileSync('.content/content.json', JSON.stringify({fetchedAt: new Date().toISOString(), siteEnv: SITE_ENV, ...data}, null, 2))
  console.log(`fetch-content: ${SITE_ENV} (${SITE_ENV === 'production' ? 'published' : 'drafts'}) -> ${data.posts.length} posts, about=${!!data.about}, notesPage=${!!data.notesPage}`)
} catch (err) {
  // Never echo the client config (it holds the token).
  console.error('fetch-content: Sanity fetch failed:', err?.statusCode || '', err?.message?.replace(token, '<redacted>'))
  process.exit(1)
}
