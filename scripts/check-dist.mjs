// Post-build guards. Fails the build if any rule is broken. Never prints secret values.
import {readFileSync, readdirSync, statSync, existsSync} from 'node:fs'
import {join} from 'node:path'
import {gzipSync} from 'node:zlib'
import {loadEnv} from './load-env.mjs'

loadEnv()

const SITE_ENV = process.env.SITE_ENV === 'production' ? 'production' : 'preview'
const envFile = process.env.SANITY_ENV_FILE || '/workspace/secrets/sanity-agent-gen.env'
const files = []
const walk = (d) => readdirSync(d).forEach((f) => { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : files.push(p) })
walk('dist')

const secrets = []
if (existsSync(envFile)) for (const line of readFileSync(envFile, 'utf8').split('\n')) {
  const m = line.match(/^\s*(SANITY_[A-Z_]*TOKEN)\s*=\s*"?([^"\n]+)"?/)
  if (m) secrets.push([m[1], m[2].trim()])
}
if (process.env.SANITY_READ_TOKEN) secrets.push(['SANITY_READ_TOKEN(env)', process.env.SANITY_READ_TOKEN])

const fail = []
const textFiles = files.filter((f) => /\.(html|js|css|xml|txt|svg|json)$/.test(f))
for (const f of files) {
  const buf = readFileSync(f)
  const s = buf.toString('latin1')
  for (const [name, val] of secrets) if (val && s.includes(val)) fail.push(`${f}: contains ${name}`)
}
for (const f of textFiles) {
  const s = readFileSync(f, 'utf8')
  if (/github\.com/i.test(s)) fail.push(`${f}: contains github.com`)
  if (/novaai/i.test(s)) fail.push(`${f}: mentions the temporary org`)
  if (/\[\[\s*SLOT/i.test(s)) fail.push(`${f}: contains a [[SLOT]] placeholder`)
  if (/\[TEAM NAME\]/.test(s)) fail.push(`${f}: contains [TEAM NAME]`)
}

const htmlFiles = files.filter((f) => f.endsWith('.html'))
const is404 = (f) => f === 'dist/404.html' || f.endsWith('/404.html')
if (SITE_ENV === 'preview') {
  for (const f of htmlFiles) {
    const s = readFileSync(f, 'utf8')
    if (!s.includes('<meta name="robots" content="noindex,nofollow">')) fail.push(`${f}: missing noindex meta`)
  }
  if (!/Disallow: \/\s*$/m.test(readFileSync('dist/robots.txt', 'utf8'))) fail.push('robots.txt does not disallow all')
} else {
  for (const f of htmlFiles) {
    if (is404(f)) continue
    const s = readFileSync(f, 'utf8')
    if (!s.includes('<meta name="robots" content="index,follow">')) fail.push(`${f}: missing index,follow robots meta`)
    if (/noindex/i.test(s)) fail.push(`${f}: noindex leftover`)
  }
  if (!existsSync('dist/robots.txt')) {
    fail.push('robots.txt missing')
  } else {
    const robots = readFileSync('dist/robots.txt', 'utf8')
    if (!/^Allow:/m.test(robots)) fail.push('robots.txt missing Allow')
    if (!/^Sitemap:\s*\S+/m.test(robots)) fail.push('robots.txt missing Sitemap: line')
    if (/noindex/i.test(robots)) fail.push('robots.txt: noindex leftover')
    if (/^Disallow:\s*\/\s*$/m.test(robots)) fail.push('robots.txt still disallows all')
  }
}

const js = files.filter((f) => f.endsWith('.js'))
let total = 0
for (const f of js) { const gz = gzipSync(readFileSync(f)).length; total += gz; console.log(`  ${f}  ${(gz / 1024).toFixed(2)} KB gz`) }
console.log(`  total JS ${(total / 1024).toFixed(2)} KB gz`)
if (total > 15 * 1024) fail.push(`JS total ${total} B gz exceeds 15 KB`)

console.log(`check-dist: ${files.length} files scanned; secrets checked: ${secrets.map(([n]) => n).join(', ') || 'none found'}`)
if (fail.length) { console.error('check-dist FAILED:\n' + fail.join('\n')); process.exit(1) }
console.log('check-dist: OK (no github.com, no temp org, no token, no placeholders' + (SITE_ENV === 'preview' ? ', noindex everywhere' : ', index,follow on content routes, robots Allow + Sitemap') + ')')
