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

// Two concentric ellipses: roles on the inner orbit, each role's own tools fanned out on the outer one
// (staggered between two radii so neighbouring labels never touch). Shared tools sit in the core.
// Wide on desktop; on phones the same map stands upright so labels stay readable.
const WIDE = { w: 880, h: 600, hub: [190, 128], out: [300, 208], stagger: 34, tiers: 2, core: 0.42 }
const TALL = { w: 400, h: 760, hub: [96, 200], out: [140, 286], stagger: 24, tiers: 3, core: 0.26 }
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

/** `a` is the outward direction (radians), used to place the label away from the centre. */
type Star = { id: string; x: number; y: number; a: number; hubs: number[] }
type Active = { kind: 'skill'; id: string } | { kind: 'role'; i: number } | null
type Dust = { x: number; y: number; r: number }

function useConstellation(stacks: string[][], { w: W, h: H, hub, out, stagger, tiers, core }: Dims) {
  return useMemo(() => {
    const cx = W / 2
    const cy = H / 2
    const on = ([rx, ry]: number[], a: number, grow = 0) => ({ x: cx + Math.cos(a) * (rx + grow), y: cy + Math.sin(a) * (ry + grow) })

    const owners = new Map<string, number[]>()
    stacks.forEach((stack, i) => stack.slice(0, PER_ROLE).forEach((s) => owners.set(s, [...(owners.get(s) ?? []), i])))
    const groups = stacks.map((_, i) => [...owners].filter(([, hs]) => hs.length === 1 && hs[0] === i).map(([id]) => id))

    // Roles form an even hexagon (first one straight up); each fans its own tools out around its angle.
    const sector = (Math.PI * 2) / stacks.length
    const hubAngles = stacks.map((_, i) => -Math.PI / 2 + i * sector)
    const hubs = hubAngles.map((a) => on(hub, a))
    const step = (sector * 0.86) / Math.max(...groups.map((g) => g.length))

    const stars: Star[] = groups.flatMap((g, i) =>
      g.map((id, k) => {
        const a = hubAngles[i] + (k - (g.length - 1) / 2) * step
        // Stagger (2 rows, 3 on phones) only near the top and bottom, where labels sit side by side; on the flanks they stack.
        const grow = Math.abs(Math.cos(a)) < 0.45 ? (k % tiers) * stagger : 0
        return { id, hubs: [i], a, ...on(out, a, grow) }
      }),
    )

    // Shared tools live in the core, pulled toward the roles they connect, then nudged apart.
    const shared: Star[] = [...owners]
      .filter(([, hs]) => hs.length > 1)
      .map(([id, hs]) => {
        const x = hs.reduce((n, h) => n + hubs[h].x, 0) / hs.length
        const y = hs.reduce((n, h) => n + hubs[h].y, 0) / hs.length
        return { id, hubs: hs, a: Math.atan2(y - cy, x - cx), x: cx + (x - cx) * core, y: cy + (y - cy) * core }
      })
    for (let k = 0; k < 60; k++)
      for (const s of shared)
        for (const o of shared) {
          if (s === o) continue
          const dx = (o.x - s.x) / 2.4
          const dy = o.y - s.y
          const d = Math.hypot(dx, dy) || 1
          if (d < 30) {
            s.x -= (dx / d) * 1.2
            s.y -= (dy / d) * 0.5
          }
        }

    // Rounded once here so every frame draws on whole-ish coordinates (crisper, no shimmer).
    const all = [...stars, ...shared].map((s) => ({ ...s, x: Math.round(s.x), y: Math.round(s.y) }))

    const rand = seeded(7)
    const dust: Dust[] = Array.from({ length: 70 }, () => ({ x: rand() * W, y: rand() * H, r: 0.4 + rand() * 1.1 }))
    return { hubs, stars: all, dust, cx, cy }
  }, [stacks, W, H, hub, out, stagger, tiers, core])
}

/** Hub → tool as a gentle curve bowed toward the core, so the lines read as one bundle instead of a mesh. */
function edgePath(h: Pt, s: Pt, cx: number, cy: number) {
  const mx = (h.x + s.x) / 2
  const my = (h.y + s.y) / 2
  return `M${h.x} ${h.y}Q${mx + (cx - mx) * 0.22} ${my + (cy - my) * 0.22} ${s.x} ${s.y}`
}

/** Label sits on the far side of the dot from the centre (above at the top, beside on the flanks…). */
function labelAt(a: number, narrow: boolean) {
  const c = Math.cos(a)
  const s = Math.sin(a)
  if (narrow || Math.abs(c) < 0.45) return { x: 0, y: s < 0 ? -9 : 15, anchor: 'middle' as const }
  return { x: c > 0 ? 8 : -8, y: 3.5 + s * 6, anchor: c > 0 ? ('start' as const) : ('end' as const) }
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
const EdgeLines = memo(function EdgeLines({ hubs, stars, dims, cx, cy }: { hubs: Pt[]; stars: Star[]; dims: Dims; cx: number; cy: number }) {
  return (
    <g>
      {/* Faint orbit guides give the map its structure. */}
      <ellipse className="lab-cosmos__orbit" cx={cx} cy={cy} rx={dims.hub[0]} ry={dims.hub[1]} />
      <ellipse className="lab-cosmos__orbit" cx={cx} cy={cy} rx={dims.out[0] + dims.stagger / 2} ry={dims.out[1] + dims.stagger / 2} />
      {stars.flatMap((s) => s.hubs.map((h) => <path key={`${s.id}-${h}`} className="lab-cosmos__edge" d={edgePath(hubs[h], s, cx, cy)} />))}
    </g>
  )
})

type SvgProps = { dims: Dims; hubs: Pt[]; stars: Star[]; cx: number; cy: number; active: Active; take: (a: Active) => void; twoLine: boolean; title: string }

/** Role pill width from its longest line (Fira Code advances ~0.6em per glyph). */
const pillWidth = (lines: string[], size: number) => Math.max(...lines.map((l) => l.length)) * size * 0.6 + 26

/** The constellation drawing: an edges sheet underneath, stars and hubs on top. */
function ConstellationSvg({ dims, hubs, stars, cx, cy, active, take, twoLine: narrow, title }: SvgProps) {
  const { w: W, h: H } = dims
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
        <EdgeLines hubs={hubs} stars={stars} dims={dims} cx={cx} cy={cy} />
      </svg>

      {/* Only the lit edges animate (a one-shot draw-in), in a sheet of their own. */}
      <svg className="lab-cosmos__flow" viewBox={box} aria-hidden="true">
        {stars.flatMap((s) =>
          s.hubs
            .filter((h) => litEdge(s, h))
            .map((h) => (
              // Keyed by the active target so the lines remount (and draw in again) on every change.
              <path key={`${activeKey}-${s.id}-${h}`} className="lab-cosmos__edge is-lit" pathLength={1} d={edgePath(hubs[h], s, cx, cy)} />
            )),
        )}
      </svg>

      <svg className={`lab-cosmos__map${active ? ' has-active' : ''}`} viewBox={box} role="img" aria-label={title}>
        {stars.map((s) => {
          const shared = s.hubs.length > 1
          const label = labelAt(s.a, narrow || shared)
          return (
            <g
              key={s.id}
              className={`lab-cosmos__star${shared ? ' is-shared' : ''}${litStar(s) ? ' is-lit' : ''}${active?.kind === 'skill' && active.id === s.id ? ' is-focus' : ''}`}
              transform={`translate(${s.x} ${s.y})`}
              tabIndex={0}
              onPointerEnter={() => take({ kind: 'skill', id: s.id })}
              onFocus={() => take({ kind: 'skill', id: s.id })}
              onClick={() => take({ kind: 'skill', id: s.id })}
            >
              <circle className="lab-cosmos__hit" r="16" />
              <circle className="lab-cosmos__dot" r={shared ? 4.5 : 2.8} />
              <text x={label.x} y={label.y} textAnchor={label.anchor}>
                {s.id}
              </text>
            </g>
          )
        })}

        {hubs.map((h, i) => {
          // On phones the pill breaks after the first word ("Senior / Product Engineer").
          const title = t.roles[i].title
          const lines = narrow && title.includes(' ') ? [title.slice(0, title.indexOf(' ')), title.slice(title.indexOf(' ') + 1)] : [title]
          const size = narrow ? 10.5 : 12
          const pw = pillWidth(lines, size)
          const ph = lines.length * (size + 4) + 12
          return (
            <g
              key={i}
              className={`lab-cosmos__hub${litHub(i) ? ' is-lit' : ''}${active?.kind === 'role' && active.i === i ? ' is-focus' : ''}`}
              transform={`translate(${h.x} ${h.y})`}
              tabIndex={0}
              onPointerEnter={() => take({ kind: 'role', i })}
              onFocus={() => take({ kind: 'role', i })}
              onClick={() => take({ kind: 'role', i })}
            >
              <ellipse className="lab-cosmos__halo" rx={pw * 0.75} ry={ph * 1.6} fill="url(#lab-cosmos-glow)" />
              <rect className="lab-cosmos__core" x={-pw / 2} y={-ph / 2} width={pw} height={ph} rx={ph / 2} />
              <text textAnchor="middle" style={{ fontSize: size }}>
                {lines.map((line, k) => (
                  <tspan key={k} x="0" y={(k - (lines.length - 1) / 2) * (size + 4) + size * 0.36}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          )
        })}
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
  const { hubs, stars, dust, cx, cy } = useConstellation(stacks, dims)
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
          <ConstellationSvg dims={dims} cx={cx} cy={cy} hubs={hubs} stars={stars} active={active} take={take} twoLine={narrow} title={c.title} />
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
