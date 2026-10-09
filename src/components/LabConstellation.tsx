import { memo, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { Rich, useLang } from '../i18n'
import { prefersReducedMotion } from '../motion'
import { SectionHead } from './SectionHead'

// Every class here is prefixed `lab-` so nothing collides with other sections.
//
// Performance notes (the map must never stutter or shimmer):
// - Parallax moves two HTML planes with translate3d from a single rAF loop that stops once settled,
//   so it runs on the compositor; the SVGs are rasterised once and never repainted while moving.
// - Nothing loops: dust is static and lit edges draw in once (pathLength=1) when the role/skill changes,
//   so an idle Lab costs zero frames. Measured: a looping twinkle + dash flow halved the frame rate.
// - Lit edges live in their own SVG, so drawing them in repaints only those lines, not the text.
// - Static geometry is memoised; pointer moves never touch React state.

type Pt = { x: number; y: number }

function useInView<T extends Element>(threshold = 0.3) {
  const ref = useRef<T>(null)
  const [state, setState] = useState({ seen: false, visible: false })
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setState((s) => ({ seen: s.seen || e.isIntersecting, visible: e.isIntersecting })), { threshold })
    io.observe(ref.current!)
    return () => io.disconnect()
  }, [threshold])
  return [ref, state] as const
}

/** Small deterministic PRNG so layouts are identical on every render and every visit. */
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}


/* ------------------------------------------------------- 1 · Constellation */

const PER_ROLE = 8

// Wide ellipse on desktop; on phones the same map stands upright so labels stay readable.
const WIDE = { w: 800, h: 540, rx: 300, ry: 200, gap: 64 }
const TALL = { w: 380, h: 640, rx: 120, ry: 265, gap: 46 }
type Dims = typeof WIDE

function useMedia(query: string) {
  const [match, setMatch] = useState(() => matchMedia(query).matches)
  useEffect(() => {
    const mq = matchMedia(query)
    const onChange = () => setMatch(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return match
}

type Star = { id: string; x: number; y: number; hubs: number[] }
type Active = { kind: 'skill'; id: string } | { kind: 'role'; i: number } | null
type Dust = { x: number; y: number; r: number }

function useConstellation(stacks: string[][], { w: W, h: H, rx, ry, gap }: Dims) {
  return useMemo(() => {
    const cx = W / 2
    const cy = H / 2
    const hubs = stacks.map((_, i) => {
      const a = (-90 + i * (360 / stacks.length)) * (Math.PI / 180)
      return { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry }
    })
    const owners = new Map<string, number[]>()
    stacks.forEach((stack, i) => stack.slice(0, PER_ROLE).forEach((s) => owners.set(s, [...(owners.get(s) ?? []), i])))

    const rand = seeded(7)
    const stars: Star[] = [...owners].map(([id, hs]) => {
      const bx = hs.reduce((a, h) => a + hubs[h].x, 0) / hs.length
      const by = hs.reduce((a, h) => a + hubs[h].y, 0) / hs.length
      const pull = hs.length === 1 ? 0.6 : 0.42
      const a = rand() * Math.PI * 2
      const r = hs.length === 1 ? 30 + rand() * 50 : 10
      return { id, hubs: hs, x: cx + (bx - cx) * pull + Math.cos(a) * r, y: cy + (by - cy) * pull + Math.sin(a) * r }
    })

    // Relax: push stars apart from each other and from the hubs so labels never pile up.
    for (let k = 0; k < 160; k++) {
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]
        for (let j = i + 1; j < stars.length; j++) {
          const o = stars[j]
          const dx = o.x - s.x
          const dy = (o.y - s.y) * 1.6
          const d = Math.hypot(dx, dy) || 1
          if (d < gap) {
            const f = (gap - d) / d / 4
            s.x -= dx * f
            s.y -= (dy / 1.6) * f
            o.x += dx * f
            o.y += (dy / 1.6) * f
          }
        }
        // Hub labels are wide, so their keep-out zone is a flat ellipse.
        for (const h of hubs) {
          const dx = (s.x - h.x) / 2
          const dy = s.y - h.y
          const d = Math.hypot(dx, dy) || 1
          if (d < 60) {
            s.x += (dx / d) * (60 - d) * 0.6
            s.y += (dy / d) * (60 - d) * 0.3
          }
        }
        s.x = Math.min(W - 40, Math.max(40, s.x))
        s.y = Math.min(H - 30, Math.max(30, s.y))
      }
    }

    // Rounded once here so every frame draws on whole-ish coordinates (crisper, no shimmer).
    for (const s of stars) {
      s.x = Math.round(s.x)
      s.y = Math.round(s.y)
    }

    const dust: Dust[] = Array.from({ length: 70 }, () => ({ x: rand() * W, y: rand() * H, r: 0.4 + rand() * 1.1 }))
    return { hubs, stars, dust }
  }, [stacks, W, H, rx, ry, gap])
}

/** Sky dust in three static sheets of different brightness. */
const DustSheets = memo(function DustSheets({ w: W, h: H, dust }: { w: number; h: number; dust: Dust[] }) {
  const sheets = [0, 1, 2].map((k) => dust.filter((_, i) => i % 3 === k))
  return (
    <>
      {sheets.map((sheet, k) => (
        <svg key={k} className="lab-cosmos__dust" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
          {sheet.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r} />
          ))}
        </svg>
      ))}
    </>
  )
})

/** Every edge, drawn once. Never re-renders when the active role or skill changes. */
const EdgeLines = memo(function EdgeLines({ hubs, stars }: { hubs: Pt[]; stars: Star[] }) {
  return (
    <g>
      {stars.flatMap((s) => s.hubs.map((h) => <line key={`${s.id}-${h}`} className="lab-cosmos__edge" x1={hubs[h].x} y1={hubs[h].y} x2={s.x} y2={s.y} />))}
    </g>
  )
})

type SvgProps = { w: number; h: number; hubs: Pt[]; stars: Star[]; active: Active; take: (a: Active) => void; twoLine: boolean; title: string }

/** The constellation drawing: an edges sheet underneath, stars and hubs on top. */
function ConstellationSvg({ w: W, h: H, hubs, stars, active, take, twoLine: narrow, title }: SvgProps) {
  const { t } = useLang()
  const litStar = (s: Star) => !active || (active.kind === 'skill' ? active.id === s.id : s.hubs.includes(active.i))
  const litHub = (i: number) => !active || (active.kind === 'role' ? active.i === i : stars.find((s) => s.id === active.id)!.hubs.includes(i))
  const litEdge = (s: Star, h: number) => !!active && (active.kind === 'skill' ? active.id === s.id : active.i === h)
  const box = `0 0 ${W} ${H}`
  const activeKey = !active ? '' : active.kind === 'role' ? `r${active.i}` : `s${active.id}`

  return (
    <>
      <svg className="lab-cosmos__edges" viewBox={box} aria-hidden="true">
        <defs>
          <linearGradient id="lab-cosmos-iri" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={W} y2={H}>
            <stop offset="0" stopColor="#5ce1ff" />
            <stop offset="0.5" stopColor="#1f7aff" />
            <stop offset="1" stopColor="#2d4bff" />
          </linearGradient>
          <radialGradient id="lab-cosmos-glow">
            <stop offset="0" stopColor="#1f7aff" stopOpacity="0.35" />
            <stop offset="1" stopColor="#1f7aff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <EdgeLines hubs={hubs} stars={stars} />
      </svg>

      {/* Only the lit edges animate (a one-shot draw-in), in a sheet of their own. */}
      <svg className="lab-cosmos__flow" viewBox={box} aria-hidden="true">
        {stars.flatMap((s) =>
          s.hubs
            .filter((h) => litEdge(s, h))
            .map((h) => (
              // Keyed by the active target so the lines remount (and draw in again) on every change.
              <line
                key={`${activeKey}-${s.id}-${h}`}
                className="lab-cosmos__edge is-lit"
                pathLength={1}
                x1={hubs[h].x}
                y1={hubs[h].y}
                x2={s.x}
                y2={s.y}
              />
            )),
        )}
      </svg>

      <svg className={`lab-cosmos__map${active ? ' has-active' : ''}`} viewBox={box} role="img" aria-label={title}>
        {stars.map((s) => (
          <g
            key={s.id}
            className={`lab-cosmos__star${litStar(s) ? ' is-lit' : ''}${active?.kind === 'skill' && active.id === s.id ? ' is-focus' : ''}`}
            transform={`translate(${s.x} ${s.y})`}
            tabIndex={0}
            onPointerEnter={() => take({ kind: 'skill', id: s.id })}
            onFocus={() => take({ kind: 'skill', id: s.id })}
            onClick={() => take({ kind: 'skill', id: s.id })}
          >
            <circle className="lab-cosmos__hit" r="16" />
            <circle className="lab-cosmos__dot" r={s.hubs.length > 1 ? 4 : 2.6} />
            <text dy="-9" textAnchor="middle">
              {s.id}
            </text>
          </g>
        ))}

        {hubs.map((h, i) => (
          <g
            key={i}
            className={`lab-cosmos__hub${litHub(i) ? ' is-lit' : ''}${active?.kind === 'role' && active.i === i ? ' is-focus' : ''}`}
            transform={`translate(${h.x} ${h.y})`}
            tabIndex={0}
            onPointerEnter={() => take({ kind: 'role', i })}
            onFocus={() => take({ kind: 'role', i })}
            onClick={() => take({ kind: 'role', i })}
          >
            <circle className="lab-cosmos__halo" r="46" fill="url(#lab-cosmos-glow)" />
            <circle className="lab-cosmos__core" r="7" />
            <text dy={narrow ? 0 : 26} textAnchor="middle">
              {narrow
                ? t.roles[i].title.split(' ').map((word, k) => (
                    <tspan key={k} x="0" dy={k ? 14 : 26}>
                      {word}
                    </tspan>
                  ))
                : t.roles[i].title}
            </text>
          </g>
        ))}
      </svg>
    </>
  )
}

/** Eased cursor parallax on two planes; the rAF loop only runs while the planes are still catching up. */
function useParallax(enabled: boolean) {
  const back = useRef<HTMLDivElement>(null)
  const front = useRef<HTMLDivElement>(null)
  const state = useRef({ tx: 0, ty: 0, x: 0, y: 0, raf: 0 })

  useEffect(() => () => cancelAnimationFrame(state.current.raf), [])

  const tick = () => {
    const s = state.current
    s.x += (s.tx - s.x) * 0.1
    s.y += (s.ty - s.y) * 0.1
    const settled = Math.abs(s.tx - s.x) < 0.0005 && Math.abs(s.ty - s.y) < 0.0005
    if (settled) {
      s.x = s.tx
      s.y = s.ty
    }
    back.current!.style.transform = `translate3d(${(s.x * -10).toFixed(2)}px, ${(s.y * -10).toFixed(2)}px, 0)`
    front.current!.style.transform = `translate3d(${(s.x * 14).toFixed(2)}px, ${(s.y * 14).toFixed(2)}px, 0)`
    s.raf = settled ? 0 : requestAnimationFrame(tick)
  }

  const aim = (x: number, y: number) => {
    if (!enabled) return
    const s = state.current
    s.tx = x
    s.ty = y
    if (!s.raf) s.raf = requestAnimationFrame(tick)
  }

  return { back, front, aim }
}

function Constellation() {
  const { t } = useLang()
  const c = t.ui.labConstellation
  const stacks = useMemo(() => t.roles.map((r) => r.stack), [t.roles])
  const narrow = useMedia('(max-width: 600px)')
  const finePointer = useMedia('(hover: hover) and (pointer: fine)')
  const dims = narrow ? TALL : WIDE
  const { w: W, h: H } = dims
  const { hubs, stars, dust } = useConstellation(stacks, dims)
  const [active, setActive] = useState<Active>(null)
  const [touched, setTouched] = useState(false)
  const [ref, view] = useInView<HTMLDivElement>(0.35)
  const { back, front, aim } = useParallax(finePointer && !prefersReducedMotion())
  const rect = useRef<DOMRect | null>(null)

  // Cycle through the roles on its own until the visitor takes over.
  useEffect(() => {
    if (!view.visible || touched || prefersReducedMotion()) return
    let i = 0
    setActive({ kind: 'role', i })
    const id = window.setInterval(() => {
      i = (i + 1) % hubs.length
      setActive({ kind: 'role', i })
    }, 2800)
    return () => clearInterval(id)
  }, [view.visible, touched, hubs.length])

  const take = (a: Active) => {
    setTouched(true)
    setActive(a)
  }

  const info = (() => {
    if (!active) return null
    if (active.kind === 'role') {
      const role = t.roles[active.i]
      return { title: role.title, sub: role.signal, chips: role.stack.slice(0, PER_ROLE) }
    }
    const star = stars.find((s) => s.id === active.id)!
    const used = [...t.projects.filter((p) => p.stack.includes(star.id)).map((p) => p.title), ...t.archive.filter((p) => p.stack.includes(star.id)).map((p) => p.name)]
    return {
      title: star.id,
      sub: `${c.roles}: ${star.hubs.map((h) => t.roles[h].title).join(' · ')}`,
      chips: used.length ? used.slice(0, 4) : [c.none],
    }
  })()

  // The rect is measured once per hover, not on every move, so pointer events never force a layout.
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = (rect.current ??= e.currentTarget.getBoundingClientRect())
    aim((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => {
    rect.current = null
    aim(0, 0)
    if (touched) setActive(null)
  }

  return (
    <div className="lab-cosmos" ref={ref}>
      <div
        className="lab-cosmos__stage"
        style={{ aspectRatio: `${W} / ${H}` }}
        onPointerEnter={() => (rect.current = null)}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        <div className="lab-cosmos__plane" ref={back}>
          <DustSheets w={W} h={H} dust={dust} />
        </div>
        <div className="lab-cosmos__plane" ref={front}>
          <ConstellationSvg w={W} h={H} hubs={hubs} stars={stars} active={active} take={take} twoLine={narrow} title={c.title} />
        </div>
      </div>

      <div className="lab-cosmos__info" aria-live="polite">
        {info ? (
          <>
            <strong>{info.title}</strong>
            <span>{info.sub}</span>
            <ul>
              {info.chips.map((chip) => (
                <li key={chip}>{chip}</li>
              ))}
            </ul>
          </>
        ) : (
          <span className="lab-cosmos__hint">{c.hint}</span>
        )}
      </div>
    </div>
  )
}


/** Lab as a constellation: the tools I use as stars, linked to the six roles; hover to follow the lines. */
export function LabConstellation() {
  const { t } = useLang()
  const c = t.ui.labConstellation
  return (
    <section className="lab" id="lab">
      <SectionHead label={t.ui.labLabel} title={c.title} lead={<Rich text={c.lead} />} />
      <Constellation />
    </section>
  )
}
