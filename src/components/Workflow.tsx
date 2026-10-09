import { type CSSProperties } from 'react'
import { useLang } from '../i18n'

const timings = [12, 840, 96, 64]

/**
 * AI & Automation demo: an n8n-style execution read top to bottom. Each node switches on in turn
 * and reports its timing, then a "lead" keeps travelling down the rail.
 */
export function Workflow() {
  const { t } = useLang()
  const wf = t.ui.workflow

  return (
    <figure className="svc-demo svc-flow">
      <figcaption className="svc-demo__bar">n8n · lead-flow</figcaption>
      <ol className="svc-flow__list">
        {wf.nodes.map(([name, action], i) => (
          <li key={name} className="svc-flow__node" style={{ '--i': i } as CSSProperties}>
            <span className="svc-flow__dot" aria-hidden="true" />
            <span className="svc-flow__name">
              <strong>{name}</strong>
              <small>{action}</small>
            </span>
            <span className="svc-ok">✓ {timings[i]} ms</span>
          </li>
        ))}
      </ol>
      <p className="svc-demo__caption">{wf.caption}</p>
    </figure>
  )
}
