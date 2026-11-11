export function NotFound() {
  return (
    <div className="container page page--center">
      <p className="eyebrow">404</p>
      <h1>This page isn’t here</h1>
      <p className="lede">The link may be old, or the page hasn’t been written yet.</p>
      <p className="hero__actions">
        <a className="button button--primary" href="/">Go to the home page</a>
        <a className="button button--ghost" href="/notes/">Read the notes</a>
      </p>
    </div>
  )
}
