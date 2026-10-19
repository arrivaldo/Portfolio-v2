import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Project, Proof } from '../data'
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

/** Manual vs. AI: both bars start together; the AI one finishes first, in proportion to the real metric. */
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
        <div key={label} className="proof__lane" style={{ '--w': `${value}%`, '--d': `${(base * Number(value)) / before}s` } as CSSProperties}>
          <span>{label}</span>
          <i />
          <b>{value}%</b>
        </div>
      ))}
      <p className="proof__delta">
        <b>−{before - after}%</b> {t.ui.proof.saved}
      </p>
    </div>
  )
}

const glyphs: Record<Extract<Proof, { kind: 'count' }>['unit'], string> = {
  person: 'M8 7.2a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2ZM3 14c0-2.8 2.2-5 5-5s5 2.2 5 5Z',
  client: 'M3 14V3.5L8 2v12M8 6h5v8M5 5h1M5 7.5h1M5 10h1M10 8.5h1M10 11h1M2 14h12',
  page: 'M4 2h5.5L12 4.5V14H4ZM9.5 2v2.5H12M6 7.5h4M6 10h4',
}

/** One glyph per real unit (people, clients, pages), lighting up in sequence. */
function Count({ to, unit }: { to: number; unit: keyof typeof glyphs }) {
  const [ref, seen] = useSeen<HTMLDivElement>()
  const solid = unit === 'person'
  return (
    <div ref={ref} className={`proof proof--count${seen ? ' is-on' : ''}`} aria-hidden="true">
      {Array.from({ length: to }, (_, i) => (
        <svg key={i} viewBox="0 0 16 16" style={{ '--i': i } as CSSProperties} className={solid ? 'is-solid' : undefined}>
          <path d={glyphs[unit]} />
        </svg>
      ))}
    </div>
  )
}

const PINGS = 6

/** Pings the live site a few times and plots the real round-trip times, with their median. */
function Live({ href }: { href: string }) {
  const { t } = useLang()
  const [ref, seen] = useSeen<HTMLDivElement>()
  const [times, setTimes] = useState<number[]>([])
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!seen) return
    let alive = true
    ;(async () => {
      for (let i = 0; i < PINGS && alive; i++) {
        const start = performance.now()
        try {
          // no-cors gives an opaque response, but it still resolves only once the server answers.
          await fetch(href, { mode: 'no-cors', cache: 'no-store' })
        } catch {
          if (alive) setFailed(true)
          return
        }
        const ms = Math.round(performance.now() - start)
        if (alive) setTimes((prev) => [...prev, ms])
        await new Promise((r) => setTimeout(r, 450))
      }
    })()
    return () => {
      alive = false
    }
  }, [seen, href])

  const sorted = [...times].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]
  const max = Math.max(...times, 1)

  return (
    <div ref={ref} className="proof proof--live">
      <div className="proof__spark" aria-hidden="true">
        {Array.from({ length: PINGS }, (_, i) => (
          <i key={i} className={times[i] !== undefined ? 'is-in' : undefined} style={{ '--h': times[i] !== undefined ? times[i] / max : 0.15 } as CSSProperties} />
        ))}
      </div>
      <p>
        <span className={`proof__ping${times.length ? ' is-up' : ''}`} aria-hidden="true" />
        {failed ? (
          t.ui.proof.live
        ) : median === undefined ? (
          t.ui.proof.checking
        ) : (
          <>
            <b>{median} ms</b> {t.ui.proof.median}
          </>
        )}
      </p>
    </div>
  )
}

export function ProjectProof({ project }: { project: Project }) {
  const p = project.proof
  if (p.kind === 'race') return <Race before={p.before} after={p.after} />
  if (p.kind === 'count') return <Count to={p.to} unit={p.unit} />
  return <Live href={project.href} />
}
