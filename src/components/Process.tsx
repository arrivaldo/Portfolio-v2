import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import type { Step } from '../data'
import { Rich, useLang } from '../i18n'
import { prefersReducedMotion } from '../motion'
import { Circle } from './Circle'
import { DeployLog, QualityGate, SolutionHub } from './ServiceDemos'
import { SectionHead } from './SectionHead'
import { Workflow } from './Workflow'

/** How long each service stays on screen before auto-advancing (tabs). */
const AUTO_MS = 7000

const demos = [DeployLog, QualityGate, Workflow, SolutionHub]

/**
 * Service layouts under comparison (same demos, different structure). Pick with ?svc=tabs|grid|sticky|accordion.
 * tabs: list on the left auto-advances, the selected service's demo plays on the right.
 * grid: 2×2 bento, every service is a card with its own demo — everything visible at once.
 * sticky: scrollytelling — the demo stays pinned while the services scroll past; the one in focus drives it.
 * accordion: four vertical panels side by side; the active one expands with its demo.
 * pipeline: the services as stages of one delivery (Solutions → Software → QA → AI), a packet runs the track.
 * orbit: the services orbit a core; the selected one's stack lands on the inner ring.
 * matrix: capability matrix — services × lifecycle phases, lead/support cells light up in a cascade.
 * index: editorial list of huge titles; hovering opens the row and a demo preview follows the cursor.
 * cube (default, chosen 2026-10-07): v1's TechStackCube cards, 3 per row — the four services plus Senior Product Engineer and Business Architect.
 *   The 3D cube itself is commented out for now (see "CUBE (disabled)").
 */
const svcParam = new URLSearchParams(window.location.search).get('svc')
const variant =
  (['tabs', 'grid', 'sticky', 'accordion', 'pipeline', 'orbit', 'matrix', 'index'] as const).find((v) => v === svcParam) ??
  'cube'

// 3D cube disabled (2026-10-07) — to restore: uncomment this, the block marked "CUBE (disabled)" below,
// and lazy / Suspense / RefObject in the react import.
// const TechCubeScene = lazy(() => import('./TechCubeScene'))

const pad = (i: number) => String(i + 1).padStart(2, '0')

/** True once the element has scrolled into view (and whether it is in view right now). */
function useInView<T extends Element>(threshold = 0.35) {
  const ref = useRef<T>(null)
  const [state, setState] = useState({ inView: false, seen: false })
  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => setState((s) => ({ inView: entry.isIntersecting, seen: s.seen || entry.isIntersecting })),
      { threshold },
    )
    io.observe(ref.current!)
    return () => io.disconnect()
  }, [threshold])
  return [ref, state] as const
}

function Info({ service }: { service: Step }) {
  return (
    <div className="services__info">
      <p className="services__text">{service.text}</p>
      <ul className="services__tags">
        {service.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    </div>
  )
}

function Tabs() {
  const { t } = useLang()
  const [ref, { inView, seen }] = useInView<HTMLDivElement>()
  const [active, setActive] = useState(0)
  const [manual, setManual] = useState(prefersReducedMotion)
  const Demo = demos[active]
  const pick = (i: number) => {
    setManual(true)
    setActive(i)
  }

  return (
    <div
      ref={ref}
      className={`services${inView ? ' is-inview' : ''}`}
      style={{ '--auto': `${AUTO_MS}ms` } as CSSProperties}
    >
      <div className="services__list" role="tablist" aria-label={t.ui.processTitle}>
        {t.process.map((s, i) => (
          <button
            key={s.title}
            type="button"
            role="tab"
            id={`svc-tab-${i}`}
            aria-selected={i === active}
            aria-controls="svc-panel"
            className={`services__tab${i === active ? ' is-active' : ''}`}
            onClick={() => pick(i)}
          >
            <span className="services__num">{pad(i)}</span>
            <span className="services__name">{s.title}</span>
            {i === active && !manual && (
              <span className="services__timer" onAnimationEnd={() => setActive((active + 1) % t.process.length)} />
            )}
          </button>
        ))}
      </div>

      <div className="services__stage" role="tabpanel" id="svc-panel" aria-labelledby={`svc-tab-${active}`}>
        <div className="services__demo" key={active}>
          {seen && <Demo />}
        </div>
        <Info service={t.process[active]} />
      </div>
    </div>
  )
}

function GridCard({ service, index }: { service: Step; index: number }) {
  const [ref, { seen }] = useInView<HTMLElement>(0.3)
  const Demo = demos[index]
  return (
    <article ref={ref} className="svc-card">
      <header className="svc-card__head">
        <span className="services__num">{pad(index)}</span>
        <h3 className="services__name">{service.title}</h3>
      </header>
      <div className="services__demo">{seen && <Demo />}</div>
      <Info service={service} />
    </article>
  )
}

function Grid() {
  const { t } = useLang()
  return (
    <div className="svc-grid">
      {t.process.map((s, i) => (
        <GridCard key={s.title} service={s} index={i} />
      ))}
    </div>
  )
}

function Sticky() {
  const { t } = useLang()
  const [active, setActive] = useState(0)
  const blocks = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    // The block crossing the middle band of the viewport is the one in focus.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index))
        })
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    blocks.current.forEach((b) => b && io.observe(b))
    return () => io.disconnect()
  }, [])

  const [ref, { seen }] = useInView<HTMLDivElement>(0.2)
  const Demo = demos[active]
  return (
    <div className="svc-sticky" ref={ref}>
      <div className="svc-sticky__stage">
        <div className="svc-sticky__count">
          {pad(active)} <span>/ {pad(t.process.length - 1)}</span>
        </div>
        <div className="services__demo" key={active}>
          {seen && <Demo />}
        </div>
      </div>
      <ol className="svc-sticky__list">
        {t.process.map((s, i) => (
          <li
            key={s.title}
            ref={(el) => {
              blocks.current[i] = el
            }}
            data-index={i}
            className={`svc-sticky__block${i === active ? ' is-active' : ''}`}
          >
            <span className="services__num">{pad(i)}</span>
            <h3 className="svc-sticky__title">{s.title}</h3>
            <Info service={s} />
          </li>
        ))}
      </ol>
    </div>
  )
}

function Accordion() {
  const { t } = useLang()
  const [ref, { seen }] = useInView<HTMLDivElement>()
  const [active, setActive] = useState(0)

  return (
    <div ref={ref} className="svc-acc">
      {t.process.map((s, i) => {
        const open = i === active
        const Demo = demos[i]
        return (
          <section
            key={s.title}
            className={`svc-acc__panel${open ? ' is-open' : ''}`}
            onMouseEnter={() => setActive(i)}
          >
            <button
              type="button"
              className="svc-acc__toggle"
              aria-expanded={open}
              aria-controls={`svc-acc-${i}`}
              onClick={() => setActive(i)}
            >
              <span className="services__num">{pad(i)}</span>
              <span className="svc-acc__title">{s.title}</span>
            </button>
            <div className="svc-acc__body" id={`svc-acc-${i}`} hidden={!open}>
              <div className="services__demo">{seen && open && <Demo />}</div>
              <Info service={s} />
            </div>
          </section>
        )
      })}
    </div>
  )
}

/** Delivery order for the pipeline: Solutions → Software → QA → AI (indexes into t.process). */
const flow = [3, 0, 1, 2]

function Pipeline() {
  const { t } = useLang()
  const [ref, { seen }] = useInView<HTMLDivElement>(0.3)
  return (
    <div ref={ref} className={`svc-pipe${seen ? ' is-live' : ''}`}>
      <div className="svc-pipe__track" aria-hidden="true">
        <i className="svc-pipe__fill" />
        <b className="svc-pipe__packet" />
      </div>
      <ol className="svc-pipe__stages">
        {flow.map((k, n) => {
          const s = t.process[k]
          return (
            <li key={s.title} className="svc-pipe__stage" style={{ '--n': n } as CSSProperties}>
              <span className="svc-pipe__station">{pad(n)}</span>
              <span className="svc-pipe__verb">{t.ui.services.stages[n]}</span>
              <h3 className="svc-pipe__title">{s.title}</h3>
              <Info service={s} />
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function Orbit() {
  const { t } = useLang()
  const [active, setActive] = useState(0)
  const s = t.process[active]
  return (
    <div className="svc-orbit">
      <div className="svc-orbit__map">
        <span className="svc-orbit__ring svc-orbit__ring--outer" aria-hidden="true" />
        <span className="svc-orbit__ring svc-orbit__ring--inner" aria-hidden="true" />
        <span className="svc-orbit__core">{t.profile.fullName.split(' ')[0]}</span>
        <div className="svc-orbit__tags" key={active} aria-hidden="true">
          {s.tags.map((tag, j) => (
            <span key={tag} style={{ '--a': `${(360 / s.tags.length) * j - 90}deg`, '--j': j } as CSSProperties}>
              <em>{tag}</em>
            </span>
          ))}
        </div>
        <div className="svc-orbit__spin">
          {t.process.map((p, i) => (
            <button
              key={p.title}
              type="button"
              className={`svc-orbit__node${i === active ? ' is-active' : ''}`}
              style={{ '--a': `${i * 90 - 135}deg` } as CSSProperties}
              aria-pressed={i === active}
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
            >
              <span className="svc-orbit__label">
                <span className="services__num">{pad(i)}</span>
                {p.title}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="svc-orbit__detail" key={active}>
        <span className="services__num">
          {pad(active)} / {pad(t.process.length - 1)}
        </span>
        <h3 className="svc-orbit__title">{s.title}</h3>
        <Info service={s} />
      </div>
    </div>
  )
}

/** 0 = not involved, 1 = support, 2 = lead. Rows follow t.process, columns follow services.phases. */
const matrix = [
  [0, 1, 2, 1, 1, 2],
  [0, 1, 0, 2, 2, 1],
  [1, 2, 2, 0, 2, 1],
  [2, 2, 1, 0, 0, 1],
]

function Matrix() {
  const { t } = useLang()
  const sv = t.ui.services
  const [ref, { seen }] = useInView<HTMLDivElement>(0.3)
  const [row, setRow] = useState(0)
  return (
    <div ref={ref} className={`svc-matrix${seen ? ' is-live' : ''}`}>
      <div className="svc-matrix__scroll">
        <div className="svc-matrix__table" role="table" aria-label={t.ui.processTitle}>
          <div className="svc-matrix__row svc-matrix__row--head" role="row">
            <span role="columnheader" />
            {sv.phases.map((p) => (
              <span key={p} role="columnheader">
                {p}
              </span>
            ))}
          </div>
          {t.process.map((s, i) => (
            <div
              key={s.title}
              role="row"
              className={`svc-matrix__row${row === i ? ' is-active' : ''}`}
              onMouseEnter={() => setRow(i)}
              onClick={() => setRow(i)}
            >
              <span role="rowheader" className="svc-matrix__name">
                <span className="services__num">{pad(i)}</span>
                {s.title}
              </span>
              {matrix[i].map((v, j) => (
                <span
                  key={j}
                  role="cell"
                  className={`svc-matrix__cell is-${['none', 'support', 'lead'][v]}`}
                  style={{ '--d': i * 6 + j } as CSSProperties}
                  aria-label={v === 2 ? sv.lead : v === 1 ? sv.support : '—'}
                >
                  <i />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="svc-matrix__foot">
        <div className="svc-matrix__legend">
          <span>
            <i className="is-lead" /> {sv.lead}
          </span>
          <span>
            <i className="is-support" /> {sv.support}
          </span>
        </div>
        <Info service={t.process[row]} />
      </div>
    </div>
  )
}

function IndexList() {
  const { t } = useLang()
  const wrap = useRef<HTMLDivElement>(null)
  const preview = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const Demo = hover === null ? null : demos[hover]

  const onMove = (e: ReactPointerEvent) => {
    const r = wrap.current!.getBoundingClientRect()
    preview.current!.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px)`
  }

  return (
    <div ref={wrap} className={`svc-index${hover !== null ? ' is-hovering' : ''}`} onPointerMove={onMove} onMouseLeave={() => setHover(null)}>
      <ol>
        {t.process.map((s, i) => (
          <li key={s.title} className={`svc-index__row${hover === i ? ' is-hover' : ''}`} onMouseEnter={() => setHover(i)}>
            <span className="services__num">{pad(i)}</span>
            <h3 className="svc-index__title">{s.title}</h3>
            <span className="svc-index__tags">{s.tags.join(' · ')}</span>
            <div className="svc-index__more">
              <p>{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <div ref={preview} className={`svc-index__preview${Demo ? ' is-on' : ''}`} aria-hidden="true">
        <div className="svc-index__card" key={hover ?? -1}>
          {Demo && <Demo />}
        </div>
      </div>
    </div>
  )
}

// ---- CUBE (disabled): v1 TechStackCube layout — 3D cube centre, services in the corners. ----
// When restoring, rename the cards-only Cube further down (or this one) to avoid the name clash.
// type Corner = 'tl' | 'tr' | 'bl' | 'br'
//
// /** Corner → service (index into t.process), mirroring v1: business top-left, AI top-right, build/quality below. */
// const corners: { pos: Corner; service: number }[] = [
//   { pos: 'tl', service: 3 },
//   { pos: 'tr', service: 2 },
//   { pos: 'bl', service: 0 },
//   { pos: 'br', service: 1 },
// ]
//
// /**
//  * Wires from each card's inner corner (where its dot sits) to just short of the cube's centre,
//  * measured from the real layout so they stay attached at any size.
//  */
// function useWires(stage: RefObject<HTMLDivElement | null>) {
//   const [wires, setWires] = useState<{ w: number; h: number; d: Partial<Record<Corner, string>> }>({ w: 0, h: 0, d: {} })
//   useEffect(() => {
//     const el = stage.current!
//     // offset* ignores transforms, so the cards' entrance animation doesn't skew the measurement.
//     const measure = () => {
//       const slot = el.querySelector<HTMLElement>('.svc-cube__slot')!
//       const cx = slot.offsetLeft + slot.offsetWidth / 2
//       const cy = slot.offsetTop + slot.offsetHeight / 2
//       const reach = slot.offsetWidth * 0.16
//       const d: Partial<Record<Corner, string>> = {}
//       el.querySelectorAll<HTMLElement>('[data-corner]').forEach((card) => {
//         const pos = card.dataset.corner as Corner
//         const left = pos.endsWith('l')
//         const top = pos.startsWith('t')
//         const x1 = card.offsetLeft + (left ? card.offsetWidth : 0)
//         const y1 = card.offsetTop + (top ? card.offsetHeight : 0)
//         const x2 = cx + (left ? -reach : reach)
//         const y2 = cy + (top ? -reach * 0.6 : reach * 0.6)
//         d[pos] = `M ${x1} ${y1} C ${x1 + (x2 - x1) * 0.6} ${y1}, ${x2 - (x2 - x1) * 0.2} ${y2}, ${x2} ${y2}`
//       })
//       setWires({ w: el.offsetWidth, h: el.offsetHeight, d })
//     }
//     measure()
//     const ro = new ResizeObserver(measure)
//     ro.observe(el)
//     return () => ro.disconnect()
//   }, [stage])
//   return wires
// }
//
// function Cube() {
//   const { t } = useLang()
//   const [ref, { inView, seen }] = useInView<HTMLDivElement>(0.2)
//   const wires = useWires(ref)
//   const [activeFace, setActiveFace] = useState<Corner | null>(null)
//   const [spinTrigger, setSpinTrigger] = useState(0)
//   const [spinning, setSpinning] = useState(false)
//
//   const spin = () => {
//     setSpinTrigger((v) => v + 1)
//     setSpinning(true)
//     window.setTimeout(() => setSpinning(false), 650)
//   }
//
//   return (
//     <div className={`svc-cube${seen ? ' is-in' : ''}`}>
//       <button type="button" className={`svc-cube__spin${spinning ? ' is-spinning' : ''}`} onClick={spin}>
//         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
//           <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5" />
//           <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 9A7.5 7.5 0 1 1 4 13.5" />
//         </svg>
//         {t.ui.services.spin}
//       </button>
//
//       <div className="svc-cube__stage" ref={ref}>
//         <svg className="svc-cube__wires" viewBox={`0 0 ${wires.w || 1} ${wires.h || 1}`} fill="none" aria-hidden="true">
//           <defs>
//             {/* Logo slash colours (Logo.tsx), for the active wire and its packets. */}
//             <linearGradient id="svc-iri" x1="0" y1="1" x2="1" y2="0">
//               <stop offset="0%" stopColor="#7ef0ff" />
//               <stop offset="50%" stopColor="#c86cff" />
//               <stop offset="100%" stopColor="#ff7ac8" />
//             </linearGradient>
//           </defs>
//           {corners.map(({ pos }) => (
//             <path
//               key={pos}
//               id={`svc-wire-${pos}`}
//               className={`svc-cube__wire${activeFace === pos ? ' is-active' : ''}`}
//               d={wires.d[pos] ?? ''}
//             />
//           ))}
//           {activeFace &&
//             [0, 1].map((i) => (
//               <circle key={`${activeFace}-${i}`} className="svc-cube__packet" r={4}>
//                 <animateMotion dur="1.2s" begin={`${i * 0.6}s`} repeatCount="indefinite">
//                   <mpath href={`#svc-wire-${activeFace}`} />
//                 </animateMotion>
//               </circle>
//             ))}
//         </svg>
//
//         {corners.map(({ pos, service }, i) => {
//           const s = t.process[service]
//           return (
//             <article
//               key={pos}
//               data-corner={pos}
//               className={`svc-cube__card svc-cube__card--${pos}${activeFace === pos ? ' is-active' : ''}`}
//               style={{ '--i': i } as CSSProperties}
//               onMouseEnter={() => setActiveFace(pos)}
//               onMouseLeave={() => setActiveFace((cur) => (cur === pos ? null : cur))}
//               // Touch has no hover: a tap turns the cube to that card (tap again to release).
//               onClick={() => setActiveFace((cur) => (cur === pos ? null : pos))}
//             >
//               <span className="svc-cube__dot" aria-hidden="true" />
//               <span className="services__num">{pad(service)}</span>
//               <h3 className="svc-cube__title">{s.title}</h3>
//               <p className="svc-cube__text">{s.text}</p>
//               <ul className="services__tags">
//                 {s.tags.map((tag) => (
//                   <li key={tag}>{tag}</li>
//                 ))}
//               </ul>
//             </article>
//           )
//         })}
//
//         <div className="svc-cube__slot">
//           {seen && (
//             <Suspense fallback={null}>
//               <TechCubeScene revealed active={inView} activeFace={activeFace} spinTrigger={spinTrigger} />
//             </Suspense>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

/** Extra capability cards for the cube layout, taken from t.roles so both languages stay in sync. */
const extraRoles = ['product-engineer', 'business-architect']

function Cube() {
  const { t } = useLang()
  const [ref, { seen }] = useInView<HTMLDivElement>(0.2)
  const cards: Step[] = [
    ...t.process,
    ...extraRoles.flatMap((slug) => {
      const role = t.roles.find((r) => r.slug === slug)
      return role ? [{ title: role.title, text: role.description, tags: role.stack.slice(0, 5) }] : []
    }),
  ]

  return (
    <div ref={ref} className={`svc-cube${seen ? ' is-in' : ''}`}>
      <div className="svc-cube__grid">
        {cards.map((s, i) => (
          <article key={s.title} className="svc-cube__card" style={{ '--i': i } as CSSProperties}>
            <span className="services__num">{pad(i)}</span>
            <h3 className="svc-cube__title">{s.title}</h3>
            <p className="svc-cube__text">{s.text}</p>
            <ul className="services__tags">
              {s.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  )
}

const layouts = {
  cube: Cube,
  tabs: Tabs,
  grid: Grid,
  sticky: Sticky,
  accordion: Accordion,
  pipeline: Pipeline,
  orbit: Orbit,
  matrix: Matrix,
  index: IndexList,
}

export function Process() {
  const { t } = useLang()
  const Layout = layouts[variant]

  return (
    <section className="process" id="process">
      <Circle size={420} style={{ top: 80, left: -220 }} speed={0.25} depth={30} />
      <SectionHead label={t.ui.processLabel} title={t.ui.processTitle} lead={<Rich text={t.ui.processIntro} />} />
      <Layout />
    </section>
  )
}
