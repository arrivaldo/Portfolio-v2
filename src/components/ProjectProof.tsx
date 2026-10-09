import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Project } from '../data'
import { useLang } from '../i18n'
import { prefersReducedMotion } from '../motion'

/** Fires once when the element scrolls into view (immediately with reduced motion). */
function useSeen<T extends Element>() {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    if (prefersReducedMotion()) {
      setSeen(true)
      return
    }
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold: 0.6 })
    io.observe(ref.current!)
    return () => io.disconnect()
  }, [])
  return [ref, seen] as const
}

/** Manual vs. AI: two bars race; the AI one finishes first, in proportion to the real metric. */
function Race({ before, after }: { before: number; after: number }) {
  const { t } = useLang()
  const [ref, seen] = useSeen<HTMLDivElement>()
  const base = 2.4
  return (
    <div ref={ref} className={`proof proof--race${seen ? ' is-on' : ''}`} aria-hidden="true">
      {[
        [t.ui.proof.manual, before],
        [t.ui.proof.withAi, after],
      ].map(([label, value]) => (
        <div key={label} className="proof__lane">
          <span>{label}</span>
          <i style={{ '--d': `${(base * Number(value)) / before}s` } as CSSProperties} />
          <b>{value}%</b>
        </div>
      ))}
    </div>
  )
}

/** One dot per unit (users, articles) lighting up in sequence. */
function Count({ to }: { to: number }) {
  const [ref, seen] = useSeen<HTMLDivElement>()
  return (
    <div ref={ref} className={`proof proof--count${seen ? ' is-on' : ''}`} aria-hidden="true">
      {Array.from({ length: to }, (_, i) => (
        <i key={i} style={{ '--i': i } as CSSProperties} />
      ))}
    </div>
  )
}

/** Pings the live site and reports the real round-trip time. */
function Live({ href }: { href: string }) {
  const { t } = useLang()
  const [ref, seen] = useSeen<HTMLDivElement>()
  const [ms, setMs] = useState<number | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!seen) return
    const start = performance.now()
    // no-cors gives an opaque response, but it still resolves only once the server answers.
    fetch(href, { mode: 'no-cors', cache: 'no-store' })
      .then(() => setMs(Math.round(performance.now() - start)))
      .catch(() => setFailed(true))
  }, [seen, href])

  return (
    <div ref={ref} className="proof proof--live">
      <span className={`proof__ping${ms !== null ? ' is-up' : ''}`} aria-hidden="true" />
      {failed ? t.ui.proof.live : ms === null ? t.ui.proof.checking : t.ui.proof.latency(ms)}
    </div>
  )
}

export function ProjectProof({ project }: { project: Project }) {
  const p = project.proof
  if (p.kind === 'race') return <Race before={p.before} after={p.after} />
  if (p.kind === 'count') return <Count to={p.to} />
  return <Live href={project.href} />
}
