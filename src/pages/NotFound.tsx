import {notFoundCopy} from '../lib/content'

export function NotFound({content}: {content?: any}) {
  const copy = notFoundCopy(content)
  return (
    <div className="container page page--center">
      <p className="eyebrow">404</p>
      <h1>{copy.heading}</h1>
      <p className="lede">{copy.lede}</p>
      <p className="hero__actions">
        <a className="button button--primary" href="/">{copy.homeLabel}</a>
      </p>
    </div>
  )
}
