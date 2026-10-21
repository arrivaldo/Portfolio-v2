import { lazy, Suspense, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { socials } from '../data'
import { useLang } from '../i18n'
import { onIntro, quiet, useSpotlight } from '../motion'

// "Beyond the code" bento: v1 globe, tech stack cube, local time, now, GitHub calendar and the chat shortcut.
// Every class is prefixed `lab-` so nothing collides.

const GH_USER = new URL(socials.find((s) => s.id === 'github')!.href).pathname.split('/')[1]

const loadGlobe = () => import('./LabGlobe')
const loadCube = () => import('./TechCubeScene')
const LabGlobe = lazy(loadGlobe)
const TechCubeScene = lazy(loadCube)

/**
 * The 3D scenes are heavy (three.js, the globe's country data and hex grid, shader compiles), and doing all of that
 * when the Lab scrolls in made the scroll stutter. Instead, once the intro is over the scenes are warmed in quiet
 * moments while the visitor is still up top: code and data first, then the globe is mounted offscreen, then the cube.
 * Each step resolves a stage number the bento mounts from; the render loops stay paused until the Lab is on screen.
 */
let warming: Promise<void> | null = null
const stageListeners = new Set<(stage: number) => void>()
let warmStage = 0
const setStage = (n: number) => {
  warmStage = Math.max(warmStage, n)
  stageListeners.forEach((fn) => fn(warmStage))
}
function warmScenes() {
  warming ??= new Promise<void>((resolve) => onIntro(resolve))
    // Evaluating the scenes' code is itself a long task, so it goes in small steps, each at its own quiet moment.
    .then(() => quiet())
    .then(() => loadCube()) // three.js + react-three-fiber + the cube
    .then(() => quiet())
    .then(() => loadGlobe()) // three-globe
    .then((m) => m.preloadGlobeData())
    .then(() => quiet())
    .then(() => setStage(1)) // mount the globe
    .then(() => new Promise((r) => setTimeout(r, 600)))
    .then(() => quiet())
    .then(() => setStage(2)) // mount the cube
  return warming
}

/** Which scenes may mount: 0 none, 1 the globe, 2 both. Advances with the warm-up, or as soon as the scroll pauses near the Lab. */
function useWarmStage(near: boolean) {
  const [stage, setLocal] = useState(warmStage)
  useEffect(() => {
    stageListeners.add(setLocal)
    warmScenes()
    return () => void stageListeners.delete(setLocal)
  }, [])
  // Close to the Lab already: mount both now — at the first pause in the scroll, never in the middle of one.
  useEffect(() => {
    if (near) quiet().then(() => setStage(2))
  }, [near])
  return stage
}

/**
 * On screen right now (to pause the 3D scenes), ever seen, and near: within about a screen and a half below the
 * viewport, so a visitor who scrolls fast still gets the scenes mounted before they arrive.
 */
function useOnScreen<T extends Element>(threshold = 0.05) {
  const ref = useRef<T>(null)
  const [state, setState] = useState({ seen: false, visible: false, near: false })
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setState((s) => ({ ...s, seen: s.seen || e.isIntersecting, visible: e.isIntersecting })), { threshold })
    const ahead = new IntersectionObserver(([e]) => e.isIntersecting && setState((s) => ({ ...s, near: true })), { rootMargin: '0px 0px 150% 0px' })
    io.observe(ref.current!)
    ahead.observe(ref.current!)
    return () => (io.disconnect(), ahead.disconnect())
  }, [threshold])
  return [ref, state] as const
}

/** Live clock in my time zone, the gap to the visitor's and whether it is day or night here. */
function LocalTime() {
  const { t } = useLang()
  const b = t.ui.lab.bento
  const zone = t.profile.timeZone
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    // Tick on the minute boundary, then every minute.
    let id = 0
    const first = window.setTimeout(() => {
      setNow(new Date())
      id = window.setInterval(() => setNow(new Date()), 60_000)
    }, 60_000 - (Date.now() % 60_000))
    return () => (clearTimeout(first), clearInterval(id))
  }, [])

  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now).map((p) => [p.type, p.value]))
  const hour = Number(parts.hour)
  const day = hour >= 7 && hour < 19
  // Hours between my zone and the visitor's, from the same instant rendered in both.
  const there = new Date(now.toLocaleString('en-US', { timeZone: zone })).getTime()
  const here = new Date(now.toLocaleString('en-US')).getTime()
  const diff = Math.round(((there - here) / 3_600_000) * 2) / 2
  const gap = diff === 0 ? b.same : `${Math.abs(diff)} h ${diff > 0 ? b.ahead : b.behind}`

  return (
    <article className="lab-bento__tile lab-bento__time">
      <h3>{b.timeTitle}</h3>
      <div className="lab-bento__clock">
        <span className={`lab-bento__sky${day ? ' is-day' : ''}`} aria-hidden="true" />
        <strong>
          {parts.hour}
          <i>:</i>
          {parts.minute}
        </strong>
      </div>
      <p>
        {t.profile.city} · {day ? b.day : b.night}
        <span>{gap}</span>
      </p>
    </article>
  )
}

/** What I am doing right now, from t.now (the same list the chat assistant knows). */
function NowTile() {
  const { t } = useLang()
  return (
    <article className="lab-bento__tile lab-bento__now">
      <h3>{t.ui.lab.bento.nowTitle}</h3>
      <ul>
        {t.now.map((n, i) => (
          <li key={n.label} style={{ '--i': i } as CSSProperties}>
            <span>{n.label}</span>
            <p>{n.text}</p>
          </li>
        ))}
      </ul>
    </article>
  )
}

type Day = { date: string; level: number }
type Year = { year: number; total: number; days: Day[] }
const CAL_CACHE = 'lab-gh-years'
/** The last three calendar years, newest last, matching the year tabs on my GitHub profile. */
const YEARS = [2, 1, 0].map((k) => new Date().getFullYear() - k)

/**
 * My contribution graph per calendar year, from a public proxy of GitHub's own graph (it matches the profile:
 * 389 in 2024, 152 in 2025…). Cached for 10 minutes.
 */
function useCalendar(enabled: boolean) {
  const [years, setYears] = useState<Year[] | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    if (!enabled) return
    try {
      const cached = JSON.parse(sessionStorage.getItem(CAL_CACHE) ?? 'null')
      if (cached && Date.now() - cached.at < 600_000) return setYears(cached.years)
    } catch {
      // storage unavailable — just fetch
    }
    Promise.all(
      YEARS.map((year) =>
        fetch(`https://github-contributions-api.jogruber.de/v4/${GH_USER}?y=${year}`)
          .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
          .then((data: { total: Record<string, number>; contributions: Day[] }) => ({
            year,
            total: data.total[year] ?? 0,
            days: data.contributions.map(({ date, level }) => ({ date, level })),
          })),
      ),
    )
      .then((next) => {
        setYears(next)
        try {
          sessionStorage.setItem(CAL_CACHE, JSON.stringify({ at: Date.now(), years: next }))
        } catch {
          // ignore
        }
      })
      .catch(() => setError(true))
  }, [enabled])
  return { years, error }
}

function GitHubTile({ enabled }: { enabled: boolean }) {
  const b = useLang().t.ui.lab.bento
  const { years, error } = useCalendar(enabled)
  const total = years?.reduce((n, y) => n + y.total, 0) ?? 0
  const today = new Date().toISOString().slice(0, 10)
  return (
    <article className="lab-bento__tile lab-bento__gh">
      <header>
        <h3>{b.ghTitle}</h3>
        <a href={`https://github.com/${GH_USER}`} target="_blank" rel="noreferrer">
          @{GH_USER} ↗
        </a>
      </header>
      {years ? (
        <>
          <p className="lab-bento__total">
            <strong>{total}</strong> {b.ghText} {YEARS[0]}
          </p>
          <div className="lab-bento__years">
            {years.map((y) => {
              // Pad the first week so columns start on Sunday, like GitHub's graph.
              const pad = new Date(`${y.days[0].date}T00:00:00Z`).getUTCDay()
              return (
                <div key={y.year} className="lab-bento__year">
                  <span>
                    {y.year}
                    <b>{y.total}</b>
                  </span>
                  <div className="lab-bento__cal" aria-label={`${y.year}: ${y.total}`}>
                    {Array.from({ length: pad }, (_, i) => (
                      <i key={`pad-${i}`} className="is-pad" />
                    ))}
                    {y.days.map((d) => (
                      <i key={d.date} data-lvl={d.level} className={d.date > today ? 'is-future' : undefined} title={d.date} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <p className="lab-bento__note">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4.5 7V5a3.5 3.5 0 0 1 7 0v2M3.5 7h9v7h-9z" />
            </svg>
            {b.ghNote}
          </p>
        </>
      ) : (
        <p className="lab-bento__muted">{error ? b.ghError : '…'}</p>
      )}
    </article>
  )
}

/** "Ask my portfolio" as a tile: each suggestion opens the chat with that question already asked. */
function AskTile() {
  const { t } = useLang()
  const b = t.ui.lab.bento
  const ask = (question?: string) => window.dispatchEvent(new CustomEvent('chat:ask', { detail: question }))
  return (
    <article className="lab-bento__tile lab-bento__ask">
      <div>
        <h3>{b.askTitle}</h3>
        <p>{b.askText}</p>
      </div>
      <div className="lab-bento__chips">
        {t.ui.chat.suggestions.map((q) => (
          <button key={q} onClick={() => ask(q)}>
            {q}
          </button>
        ))}
        <button className="is-main" onClick={() => ask()}>
          {b.askOpen} →
        </button>
      </div>
    </article>
  )
}

/** Placeholder over a 3D scene until its first frame is drawn, then it fades out. */
function SceneLoader({ done, label }: { done: boolean; label: string }) {
  return (
    <div className={`lab-loader${done ? ' is-done' : ''}`} role="status" aria-hidden={done}>
      <span className="lab-loader__ring" aria-hidden="true" />
      <span className="lab-loader__label">{label}</span>
    </div>
  )
}

/**
 * The Lab bento: where I work from (v1 globe + my local time), what I am on right now, what I build with (stack
 * cube), my GitHub graph and a door into the AI assistant. Six tiles, no empty cells at any width.
 */
export function LabBento() {
  const { t } = useLang()
  const b = t.ui.lab.bento
  const [ref, { seen, visible, near }] = useOnScreen<HTMLDivElement>()
  const stage = useWarmStage(near)
  useSpotlight('.lab-bento__tile', ref)
  const tools = useMemo(() => new Set(t.roles.flatMap((r) => r.stack)).size, [t.roles])
  // Each press bumps the trigger; the cube plays a two-turn spin whenever it changes.
  const [spin, setSpin] = useState(0)
  // Each scene reports its first drawn frame; until then its tile shows a loader.
  const [globeReady, setGlobeReady] = useState(false)
  const [cubeReady, setCubeReady] = useState(false)

  return (
    <div className="lab-bento" ref={ref} data-reveal-stagger>
      <article className="lab-bento__tile lab-bento__globe">
        <div className="lab-bento__scene">
          {stage >= 1 && (
            <Suspense fallback={null}>
              <LabGlobe active={visible} onReady={() => setGlobeReady(true)} />
            </Suspense>
          )}
          <SceneLoader done={globeReady} label={b.loading} />
        </div>
        <div className="lab-bento__cap">
          <h3>{b.globeTitle}</h3>
          <p>{b.globeText}</p>
        </div>
      </article>

      <LocalTime />
      <NowTile />

      <article className="lab-bento__tile lab-bento__cube">
        <div className="lab-bento__scene">
          {stage >= 2 && (
            <Suspense fallback={null}>
              <TechCubeScene revealed={seen} active={visible} spinTrigger={spin} onReady={() => setCubeReady(true)} />
            </Suspense>
          )}
          <SceneLoader done={cubeReady} label={b.loading} />
          {cubeReady && (
            <button type="button" className="lab-bento__spin" onClick={() => setSpin((n) => n + 1)} title={b.spin}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5" />
              </svg>
              {b.spinLabel}
            </button>
          )}
        </div>
        <div className="lab-bento__cap">
          <h3>{b.cubeTitle}</h3>
          <p>
            <strong>{tools}</strong> {b.cubeText}
          </p>
        </div>
      </article>

      <GitHubTile enabled={stage >= 1 || seen} />
      <AskTile />
    </div>
  )
}
