// Prerender every day-1 route to static HTML in dist/, plus sitemap.xml and robots.txt.
import {readFileSync, writeFileSync, mkdirSync, rmSync, existsSync} from 'node:fs'
import {dirname, join} from 'node:path'
import {createHighlighter, createCssVariablesTheme} from 'shiki'

const SITE_ENV = process.env.SITE_ENV === 'production' ? 'production' : 'preview'
const PROD = 'https://agent-gen.ca'
const content = JSON.parse(readFileSync('.content/content.json', 'utf8'))
if (content.siteEnv !== SITE_ENV) {
  console.error(`prerender: content was fetched for ${content.siteEnv}, but SITE_ENV=${SITE_ENV}. Run the fetch step again.`)
  process.exit(1)
}

// --- Syntax highlighting at build time (Shiki, CSS-variable theme mapped to tokens) ---
const theme = createCssVariablesTheme({name: 'css-variables', variablePrefix: '--shiki-', fontStyle: true})
const docs = [...content.posts, content.about, ...(content.about?.sections || [])].filter(Boolean)
const langs = new Set()
for (const d of docs) for (const b of d.body || []) if (b._type === 'codeBlock') langs.add(b.language === 'text' ? 'text' : b.language || 'text')
const highlighter = await createHighlighter({themes: [theme], langs: [...langs].filter((l) => l !== 'text')})
for (const d of docs) for (const b of d.body || []) {
  if (b._type !== 'codeBlock') continue
  const lang = !b.language || b.language === 'text' || !highlighter.getLoadedLanguages().includes(b.language) ? 'text' : b.language
  b.html = highlighter.codeToHtml(b.code || '', {lang, theme: 'css-variables'}).replace(/ tabindex="0"/, '')
}

// --- Assets from the client build ---
const manifest = JSON.parse(readFileSync('dist/.vite/manifest.json', 'utf8'))
const entry = manifest['src/client/main.ts']
const cssFiles = entry.css || Object.values(manifest).filter((m) => m.file.endsWith('.css')).map((m) => m.file)
const css = cssFiles.map((f) => readFileSync(join('dist', f), 'utf8')).join('\n')
for (const f of cssFiles) rmSync(join('dist', f))
const js = '/' + entry.file

const {buildPages} = await import(new URL('../.ssr/entry-server.mjs', import.meta.url))
const {pages, lang} = buildPages(content, SITE_ENV)

// Applied before first paint: persisted theme + js flag (no theme flash).
const themeScript = `(function(){var d=document.documentElement;d.classList.add('js');try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')d.setAttribute('data-theme',t)}catch(e){}})()`

const tpl = (p) => `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>${themeScript}</script>
${p.head}
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#FAF8F4" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0E1013" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/space-grotesk.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<style>${css}</style>
<script type="module" src="${js}"></script>
</head>
<body>
${p.html}
</body>
</html>
`

for (const p of pages) {
  const out = join('dist', p.file)
  mkdirSync(dirname(out), {recursive: true})
  writeFileSync(out, tpl(p))
}

const sitemapUrls = pages.filter((p) => p.inSitemap).map((p) => {
  const last = p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : ''
  return `  <url><loc>${PROD}${p.path}</loc>${last}</url>`
}).join('\n')
writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls}
</urlset>
`)
writeFileSync('dist/robots.txt', SITE_ENV === 'production'
  ? `User-agent: *\nAllow: /\n\nSitemap: ${PROD}/sitemap.xml\n`
  : `# preview.agent-gen.ca: not for search engines\nUser-agent: *\nDisallow: /\n`)

rmSync('dist/.vite', {recursive: true, force: true})
console.log(`prerender (${SITE_ENV}): ${pages.map((p) => p.path).join(', ')} + sitemap.xml + robots.txt`)
