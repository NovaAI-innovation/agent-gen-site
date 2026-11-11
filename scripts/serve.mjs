// Minimal static server for dist/ (directory index + 404.html), for local checks.
import {createServer} from 'node:http'
import {readFile, stat} from 'node:fs/promises'
import {join, extname, normalize} from 'node:path'
const root = 'dist', port = Number(process.env.PORT || 4173)
const types = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json'}
createServer(async (req, res) => {
  let p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '')
  let file = join(root, p)
  try {
    const s = await stat(file)
    if (s.isDirectory()) {
      if (!p.endsWith('/')) { res.writeHead(301, {Location: p + '/'}); return res.end() }
      file = join(file, 'index.html')
    }
    const body = await readFile(file)
    const cache = file.includes('/assets/') || file.includes('/fonts/') ? 'public, max-age=31536000, immutable' : 'no-cache'
    res.writeHead(200, {'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': cache, 'X-Robots-Tag': 'noindex, nofollow'})
    res.end(body)
  } catch {
    res.writeHead(404, {'Content-Type': types['.html']})
    res.end(await readFile(join(root, '404.html')))
  }
}).listen(port, () => console.log(`serving dist on http://localhost:${port}`))
