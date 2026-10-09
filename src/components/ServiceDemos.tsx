import { type CSSProperties } from 'react'
import { useLang } from '../i18n'

const deploySteps: [string, string][] = [
  ['install', '4.2s'],
  ['lint', '1.1s'],
  ['test', '128 ✓'],
  ['build', '12.8s'],
  ['deploy', 'AWS · us-east-1'],
]

/** Software Engineering demo: a push going all the way to production. */
export function DeployLog() {
  const { t } = useLang()
  return (
    <figure className="svc-demo svc-log">
      <figcaption className="svc-demo__bar">deploy.log</figcaption>
      <ol>
        <li className="svc-log__cmd" style={{ '--i': 0 } as CSSProperties}>
          $ git push origin main
        </li>
        {deploySteps.map(([step, result], i) => (
          <li key={step} style={{ '--i': i + 1 } as CSSProperties}>
            <span className="svc-log__step">▸ {step}</span>
            <span className="svc-ok">✓ {result}</span>
          </li>
        ))}
        <li className="svc-log__live" style={{ '--i': deploySteps.length + 1 } as CSSProperties}>
          <i aria-hidden="true" />
          {t.ui.services.live}
        </li>
      </ol>
    </figure>
  )
}

/** Quality Assurance demo: every suite fills up until the release gate opens. */
export function QualityGate() {
  const { gate } = useLang().t.ui.services
  return (
    <figure className="svc-demo svc-gate">
      <figcaption className="svc-demo__bar">quality-gate</figcaption>
      <ul>
        {gate.suites.map(([suite, result], i) => (
          <li key={suite} style={{ '--i': i } as CSSProperties}>
            <span className="svc-gate__name">{suite}</span>
            <span className="svc-gate__bar" aria-hidden="true">
              <i />
            </span>
            <span className="svc-ok">✓ {result}</span>
          </li>
        ))}
      </ul>
      <p className="svc-gate__badge" style={{ '--i': gate.suites.length } as CSSProperties}>
        {gate.passed}
      </p>
    </figure>
  )
}

const satellites = [
  { name: 'Salesforce', x: 20, y: 18 },
  { name: 'SAP', x: 290, y: 18 },
  { name: 'Pega', x: 20, y: 186 },
  { name: 'Power BI', x: 290, y: 186 },
]

/** Solutions Engineering demo: four systems wired into one business core, data flowing both ways. */
export function SolutionHub() {
  const { hub } = useLang().t.ui.services
  return (
    <figure className="svc-demo svc-hub">
      <figcaption className="svc-demo__bar">architecture</figcaption>
      <svg viewBox="0 0 420 240" role="img" aria-label={`${hub.core}: ${satellites.map((s) => s.name).join(', ')}`}>
        {satellites.map((s, i) => {
          const d = `M${s.x + 55} ${s.y + 18} L210 120`
          return (
            <g key={s.name} style={{ '--i': i } as CSSProperties}>
              <path className="svc-hub__wire" d={d} />
              <path className={`svc-hub__flow${i === 3 ? ' is-out' : ''}`} d={d} />
            </g>
          )
        })}
        <g className="svc-hub__core">
          <rect x="140" y="96" width="140" height="48" rx="12" />
          <text x="210" y="125">
            {hub.core}
          </text>
        </g>
        {satellites.map((s, i) => (
          <g key={s.name} className="svc-hub__node" style={{ '--i': i } as CSSProperties}>
            <rect x={s.x} y={s.y} width="110" height="36" rx="10" />
            <text x={s.x + 55} y={s.y + 22}>
              {s.name}
            </text>
          </g>
        ))}
      </svg>
      <p className="svc-demo__caption">{hub.caption}</p>
    </figure>
  )
}
