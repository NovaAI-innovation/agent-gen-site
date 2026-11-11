import type {ReactNode} from 'react'
import {clean, safeHref, githubOrgUrl} from '../lib/content'

const SunIcon = () => (
  <svg className="icon icon--sun" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)
const MoonIcon = () => (
  <svg className="icon icon--moon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
    <path d="M20 14.6A8.2 8.2 0 0 1 9.4 4a8.2 8.2 0 1 0 10.6 10.6Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
)

export function Header({settings, path}: {settings: any; path: string}) {
  const nav = (settings.mainNav || []).filter((l: any) => clean(l.label) && safeHref(l.href))
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <a className="wordmark" href="/" {...(path === '/' ? {'aria-current': 'page' as const} : {})}>
          {clean(settings.siteTitle) || 'agent-gen'}
        </a>
        <nav aria-label="Main" className="site-nav">
          <ul>
            {nav.map((l: any) => {
              const href = safeHref(l.href)!
              const current = path === href ? 'page' : path.startsWith(href) && href !== '/' ? 'true' : undefined
              return (
                <li key={l._key || href}>
                  <a href={href} aria-current={current as any}>{l.label}</a>
                </li>
              )
            })}
          </ul>
          <button type="button" className="theme-toggle" aria-pressed="false" data-theme-toggle>
            <SunIcon />
            <MoonIcon />
            <span className="visually-hidden">Dark theme</span>
          </button>
        </nav>
      </div>
    </header>
  )
}

export function Footer({settings, year}: {settings: any; year: number}) {
  const f = settings.footer || {}
  const nav = [...(f.links?.length ? f.links : settings.mainNav || [])].filter((l: any) => clean(l.label) && safeHref(l.href))
  const copyright = clean(f.copyrightName)
  const licence = clean(f.licenceNote)
  const gh = githubOrgUrl(settings)
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__meta">
          {clean(f.tagline) && <p className="site-footer__tagline">{f.tagline}</p>}
          {licence && (
            <p>
              {licence === 'Text: CC BY 4.0 · Code: MIT' ? (
                <>
                  Text: <a href="https://creativecommons.org/licenses/by/4.0/" rel="license noopener">CC BY 4.0</a> · Code:{' '}
                  <a href="https://opensource.org/license/mit" rel="license noopener">MIT</a>
                </>
              ) : licence}
            </p>
          )}
          {clean(f.locationNote) && <p>{f.locationNote}</p>}
          {copyright && <p>© {year} {copyright}</p>}
        </div>
        <nav aria-label="Footer" className="site-footer__nav">
          <ul>
            <li><a href="/">Home</a></li>
            {nav.map((l: any) => <li key={l._key || l.href}><a href={safeHref(l.href)}>{l.label}</a></li>)}
            {gh && <li><a href={gh} rel="noopener">Code</a></li>}
          </ul>
        </nav>
      </div>
    </footer>
  )
}

export function Layout({settings, path, children, year}: {settings: any; path: string; children: ReactNode; year: number}) {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header settings={settings} path={path} />
      <main id="main" tabIndex={-1}>{children}</main>
      <Footer settings={settings} year={year} />
      <p className="visually-hidden" aria-live="polite" id="live-region"></p>
    </>
  )
}
