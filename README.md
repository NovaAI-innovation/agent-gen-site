# agent-gen-site

Day-1 site for agent-gen.ca: React + Vite, every route prerendered to static HTML at build time.
Content comes from Sanity (`jqsksqmz` / `production`) at build time only.

## Scripts
- `npm run build`: generate token CSS, fetch Sanity (preview = `drafts` perspective), build the client islands, SSR-build the React pages, prerender every route, then run `scripts/check-dist.mjs` (fails on github.com, temp-org mentions, the Sanity token, `[[SLOT` / `[TEAM NAME]`, missing noindex, or JS > 15 KB gz).
- `npm run build:production`: same with `SITE_ENV=production` (published perspective, `index,follow`, robots allow + sitemap). Production deploy needs Casey's approval.
- `npm run serve`: serve `dist/` locally on :4173.
- `npm run deploy` / `deploy:preview`: rsync `dist/` to `/var/www/preview.agent-gen.ca/` only (keeps `.well-known/`).

## Secrets and environment
Copy `.env.example` to `.env` (gitignored) and fill in values. Scripts also read existing environment
variables, which take precedence over `.env`. There are no hardcoded fallbacks: if a required
variable is unset, the script exits and names the variable.

The Sanity read token is read at build time from `SANITY_READ_TOKEN` or the file pointed to by
`SANITY_ENV_FILE`. It is never written to disk, the client bundle, or HTML. Preview deploys require
`DEPLOY_HOST` and `DEPLOY_KEY`.

## Config
`src/site.config.ts` → `site.githubOrg` (null on day 1). While null, no repo/GitHub link renders anywhere.

## Layout
- `src/pages/*`, `src/components/*`: React components, rendered to static markup.
- `src/client/*`: the only browser JS (~2.7 KB gz): theme toggle, code copy, hero graph animation.
- `src/lib/graph.ts`: seeded graph shared by the prerendered SVG and the animation.
- `tokens/tokens.json`: Design Lead tokens → `scripts/tokens.mjs` → `src/styles/tokens.css`.
- Fonts: Space Grotesk, Inter, JetBrains Mono variable Latin woff2 (SIL OFL 1.1) self-hosted in `public/fonts`.
