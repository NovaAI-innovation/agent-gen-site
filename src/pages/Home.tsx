import {AgentGraph} from '../components/AgentGraph'
import {clean, safeHref, noteUrl, githubOrgUrl, ownerAttribution, isOwnerVoice} from '../lib/content'
import {OwnerAttr, PostCard} from './shared'

function Hero({hero}: {hero: any}) {
  const cta = hero.primaryCta
  const showCta = cta && cta.enabled !== false && clean(cta.label) && safeHref(cta.href)
  const second = hero.secondaryCta
  const showSecond = second && second.enabled !== false && clean(second.label) && safeHref(second.href)
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__art">
        <AgentGraph />
      </div>
      <div className="container hero__inner">
        <div className="hero__copy">
          {clean(hero.eyebrow) && <p className="eyebrow">{hero.eyebrow}</p>}
          <h1 id="hero-title" className="hero__title">{hero.headline}</h1>
          {clean(hero.subhead) && <p className="hero__sub">{hero.subhead}</p>}
          {(showCta || showSecond) && (
            <p className="hero__actions">
              {showCta && <a className="button button--primary" href={safeHref(cta.href)}>{cta.label}</a>}
              {showSecond && <a className="button button--ghost" href={safeHref(second.href)}>{second.label}</a>}
            </p>
          )}
        </div>
      </div>
      <button type="button" className="graph-toggle" data-graph-toggle hidden>
        <svg className="icon icon--pause" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M8 5v14M16 5v14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
        <svg className="icon icon--play" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>
        <span data-graph-label>Pause</span><span className="visually-hidden"> animation</span>
      </button>
    </section>
  )
}

function Purpose({section, index, owner}: {section: any; index: number; owner?: {label: string; href: string}}) {
  const items = (section.items || []).filter((it: any) => clean(it.title) && clean(it.body))
  const numbered = items.some((it: any) => clean(it.label))
  return (
    <section className={`band purpose ${index === 0 ? 'purpose--primary' : 'purpose--secondary'}`} id={section.anchor} aria-labelledby={`${section.anchor}-h`}>
      <div className="container">
        <div className="band__head">
          <h2 id={`${section.anchor}-h`}>{section.heading}</h2>
          {clean(section.intro) && <p className="band__intro">{section.intro}</p>}
        </div>
        <ol className={`purpose__list ${numbered ? 'purpose__list--numbered' : ''}`} role="list">
          {items.map((it: any) => (
            <li key={it._key} className="purpose__item">
              {clean(it.label) && <span className="purpose__label" aria-hidden="true">{it.label}</span>}
              <h3>{it.title}</h3>
              <p>{it.body}</p>
              {owner && isOwnerVoice(it.voice) && <OwnerAttr attr={owner} />}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Coming({section, notice, settings, owner}: {section: any; notice: any; settings: any; owner?: {label: string; href: string}}) {
  const cards = (section.cards || []).filter((c: any) => clean(c.title) && clean(c.description))
  const gh = notice?.showCodeLink ? githubOrgUrl(settings) : undefined
  return (
    <section className="band coming" id={section.anchor} aria-labelledby={`${section.anchor}-h`}>
      <div className="container">
        <div className="band__head">
          <h2 id={`${section.anchor}-h`}>{section.heading}</h2>
          {clean(section.intro) && <p className="band__intro">{section.intro}</p>}
        </div>
        <ul className="coming__list" role="list">
          {cards.map((c: any) => (
            <li key={c._key} className="coming__card">
              <div className="coming__top">
                <h3>{c.title}</h3>
                {clean(c.statusLabel) && <span className="pill">{c.statusLabel}</span>}
              </div>
              <p>{c.description}</p>
              {owner && isOwnerVoice(c.voice) && <OwnerAttr attr={owner} />}
            </li>
          ))}
        </ul>
        {clean(section.statusNote) && <p className="coming__note">{section.statusNote}</p>}
        {notice?.enabled !== false && clean(notice?.heading) && clean(notice?.body) && (
          <aside className="notice" aria-labelledby="notice-h">
            <h3 id="notice-h">{notice.heading}</h3>
            <p>{notice.body}</p>
            {gh && <p><a href={gh} rel="noopener">View the code</a></p>}
          </aside>
        )}
      </div>
    </section>
  )
}

function Latest({cfg, posts}: {cfg: any; posts: any[]}) {
  if (cfg?.enabled === false) return null
  const list = posts.slice(0, cfg?.count || 3)
  return (
    <section className="band latest" aria-labelledby="latest-h">
      <div className="container">
        <div className="band__head band__head--row">
          <h2 id="latest-h">{clean(cfg?.heading) || 'Latest notes'}</h2>
          {list.length > 0 && <a className="arrow-link" href="/notes/">{clean(cfg?.allLabel) || 'All notes'}<span aria-hidden="true"> →</span></a>}
        </div>
        {list.length ? (
          <ul className="cards" role="list">
            {list.map((p) => <li key={p.slug}><PostCard post={p} headingLevel={3} /></li>)}
          </ul>
        ) : (
          <p>{clean(cfg?.emptyText) || 'The first notes are on the way.'}</p>
        )}
      </div>
    </section>
  )
}

export function Home({content}: {content: any}) {
  const {home, settings, posts, about} = content
  const owner = ownerAttribution(about)
  return (
    <>
      <Hero hero={home.hero} />
      {(home.purposeSections || []).map((s: any, i: number) => <Purpose key={s._key} section={s} index={i} owner={owner} />)}
      {home.contentSection && <Coming section={home.contentSection} notice={home.comingSoonNotice} settings={settings} owner={owner} />}
      <Latest cfg={home.latestNotes} posts={posts} />
    </>
  )
}
export {noteUrl}
