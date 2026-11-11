import type {ReactNode} from 'react'
import {blockText, isPlaceholder, safeHref, isExternal} from '../lib/content'

function Span({child, markDefs}: {child: any; markDefs: any[]}) {
  let node: ReactNode = child.text
  for (const mark of child.marks || []) {
    if (mark === 'strong') node = <strong>{node}</strong>
    else if (mark === 'em') node = <em>{node}</em>
    else if (mark === 'code') node = <code>{node}</code>
    else {
      const def = markDefs.find((d) => d._key === mark)
      if (def?._type === 'link') {
        const href = safeHref(def.href)
        if (href) node = <a href={href} {...(isExternal(href) ? {rel: 'noopener'} : {})}>{node}</a>
      }
    }
  }
  return <>{node}</>
}

function Inline({block}: {block: any}) {
  return <>{(block.children || []).map((c: any, i: number) => <Span key={c._key || i} child={c} markDefs={block.markDefs || []} />)}</>
}

export function slugify(s: string) {
  return s.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function CodeBlock({block}: {block: any}) {
  const label = block.filename || block.language || 'code'
  return (
    <figure className="code">
      <figcaption className="code__bar">
        <span className="code__file">{block.filename || ' '}</span>
        <span className="code__lang">{block.language && block.language !== 'text' ? block.language : ''}</span>
        <button type="button" className="code__copy" data-copy hidden>
          Copy<span className="visually-hidden"> code from {label}</span>
        </button>
      </figcaption>
      <div
        className="code__body"
        role="region"
        aria-label={`Code: ${label}`}
        tabIndex={0}
        dangerouslySetInnerHTML={{__html: block.html}}
      />
    </figure>
  )
}

const CALLOUT_LABEL: Record<string, string> = {tip: 'Tip', note: 'Note', warning: 'Warning'}
function Callout({block}: {block: any}) {
  const tone = CALLOUT_LABEL[block.tone] ? block.tone : 'note'
  return (
    <aside className={`callout callout--${tone}`} aria-label={CALLOUT_LABEL[tone]}>
      <p className="callout__label">{CALLOUT_LABEL[tone]}</p>
      <p>{block.body}</p>
    </aside>
  )
}

function Figure({block}: {block: any}) {
  const ref: string | undefined = block.asset?._ref
  if (!ref || !block.alt) return null
  // image-<id>-<w>x<h>-<ext>
  const m = ref.match(/^image-([a-f0-9]+)-(\d+)x(\d+)-(\w+)$/)
  if (!m) return null
  const [, id, w, h, ext] = m
  const src = `https://cdn.sanity.io/images/jqsksqmz/production/${id}-${w}x${h}.${ext}?auto=format&w=1360`
  return (
    <figure className="figure">
      <img src={src} alt={block.alt} width={Number(w)} height={Number(h)} loading="lazy" decoding="async" />
      {block.caption && !isPlaceholder(block.caption) && <figcaption>{block.caption}</figcaption>}
    </figure>
  )
}

export function PortableText({value}: {value: any[]}) {
  const blocks = (value || []).filter((b) => !isPlaceholder(blockText(b)))
  const out: ReactNode[] = []
  let i = 0
  while (i < blocks.length) {
    const b = blocks[i]
    if (b._type === 'block' && b.listItem) {
      const type = b.listItem
      const items: any[] = []
      while (i < blocks.length && blocks[i]._type === 'block' && blocks[i].listItem === type) items.push(blocks[i++])
      const Tag = type === 'number' ? 'ol' : 'ul'
      out.push(<Tag key={b._key}>{items.map((it) => <li key={it._key}><Inline block={it} /></li>)}</Tag>)
      continue
    }
    i++
    if (b._type === 'block') {
      const text = blockText(b)
      if (!text.trim()) continue
      if (b.style === 'h2') out.push(<h2 key={b._key} id={slugify(text)}><Inline block={b} /></h2>)
      else if (b.style === 'h3') out.push(<h3 key={b._key} id={slugify(text)}><Inline block={b} /></h3>)
      else if (b.style === 'blockquote') out.push(<blockquote key={b._key}><p><Inline block={b} /></p></blockquote>)
      else out.push(<p key={b._key}><Inline block={b} /></p>)
    } else if (b._type === 'codeBlock') out.push(<CodeBlock key={b._key} block={b} />)
    else if (b._type === 'callout') out.push(<Callout key={b._key} block={b} />)
    else if (b._type === 'figure') out.push(<Figure key={b._key} block={b} />)
  }
  return <>{out}</>
}
