import { lazy, Suspense, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { socials } from '../data'
import { useLang } from '../i18n'
import { onIntro, prefersReducedMotion, quiet } from '../motion'

// The four Lab demos (picked in Lab.tsx with ?lab=). Every class is prefixed `lab-` so nothing collides.
// Each one shows a piece of my actual work instead of describing it: automation, live activity, planning, incidents.

/** True once the element has been on screen (the demos start themselves the first time they are seen). */
function useSeen<T extends Element>(threshold = 0.35) {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold })
    io.observe(ref.current!)
    return () => io.disconnect()
  }, [threshold])
  return [ref, seen] as const
}

/** 5400 → "1:30:00", 42 → "0:42". */
function clock(sec: number) {
  const s = Math.floor(sec)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const pad = (n: number) => String(n).padStart(2, '0')
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`
}

/* --------------------------------------------------- 1 · Automate this */

const MANUAL_MS = 7000
const AUTO_MS = 1800

/** A manual task races its automation; the result is the hours a month it gives back. */
export function LabAutomate() {
  const c = useLang().t.ui.lab.automate
  const [pick, setPick] = useState(0)
  const [start, setStart] = useState<number | null>(null)
  const [now, setNow] = useState(0)
  const [ref, seen] = useSeen<HTMLDivElement>()
  const task = c.tasks[pick]

  const run = () => {
    const t = performance.now()
    setStart(t)
    setNow(prefersReducedMotion() ? t + MANUAL_MS : t)
  }

  useEffect(() => {
    if (seen && start === null) run()
  }, [seen]) // eslint-disable-line react-hooks/exhaustive-deps

  // One rAF loop per race, stopped as soon as the slower lane finishes.
  useEffect(() => {
    if (start === null || prefersReducedMotion()) return
    let raf = 0
    const tick = () => {
      const t = performance.now()
      setNow(t)
      if (t - start < MANUAL_MS) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [start])

  const elapsed = start === null ? 0 : now - start
  const pm = Math.min(1, elapsed / MANUAL_MS)
  const pa = Math.min(1, elapsed / AUTO_MS)
  const done = start !== null && pm >= 1
  const saved = Math.round(((task.manualMin - task.autoSec / 60) * task.runsPerMonth) / 60)
  const state = (p: number, i: number, n: number) => (p * n >= i + 1 ? 'is-done' : Math.floor(p * n) === i && start !== null ? 'is-active' : '')

  return (
    <div className="lab-auto" ref={ref}>
      <div className="lab-auto__tabs" role="tablist">
        {c.tasks.map((tk, i) => (
          <button
            key={tk.id}
            role="tab"
            aria-selected={i === pick}
            className={`lab-auto__tab${i === pick ? ' is-on' : ''}`}
            onClick={() => {
              setPick(i)
              run()
            }}
          >
            {tk.name}
          </button>
        ))}
      </div>

      <div className="lab-auto__arena">
        <section className="lab-auto__lane">
          <header>
            <span>{c.manual}</span>
            <b className="lab-auto__clock">{clock(pm * task.manualMin * 60)}</b>
          </header>
          <div className="lab-auto__bar">
            <i style={{ transform: `scaleX(${pm})` }} />
          </div>
          <ol>
            {task.manual.map((step, i) => (
              <li key={step} className={state(pm, i, task.manual.length)}>
                {step}
              </li>
            ))}
          </ol>
        </section>

        <section className="lab-auto__lane is-auto">
          <header>
            <span>{c.auto}</span>
            <b className="lab-auto__clock">{clock(pa * task.autoSec)}</b>
          </header>
          <div className="lab-auto__bar">
            <i style={{ transform: `scaleX(${pa})` }} />
          </div>
          <ol>
            {task.auto.map(([step, tool], i) => (
              <li key={step} className={state(pa, i, task.auto.length)}>
                {step}
                <small>{tool}</small>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <footer className="lab-auto__foot">
        <div className={`lab-auto__result${done ? ' is-on' : ''}`} aria-live="polite">
          {done && (
            <>
              <strong>~{saved} h</strong>
              <span>
                {c.saved} · {task.runsPerMonth} {c.perMonth}
              </span>
            </>
          )}
        </div>
        <button className="lab-btn" onClick={run}>
          {start === null ? c.run : c.again}
        </button>
        <p className="lab-note">{c.note}</p>
      </footer>
    </div>
  )
}

/* -------------------------------------------------- 2 · Mission control */

type Repo = { name: string; html_url: string; description: string | null; language: string | null; pushed_at: string; fork: boolean }
type GhEvent = { type: string; created_at: string; repo: { name: string }; payload: { size?: number; ref?: string; commits?: { message: string }[] } }
type GhData = { repos: Repo[]; events: GhEvent[] }

const GH_USER = new URL(socials.find((s) => s.id === 'github')!.href).pathname.split('/')[1]
const GH_CACHE = 'lab-gh'
const DAYS = 364

/** Public repos and events, cached for 10 minutes so reloads stay well under GitHub's anonymous rate limit. */
function useGitHub(enabled: boolean) {
  const [data, setData] = useState<GhData | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    if (!enabled) return
    try {
      const cached = JSON.parse(sessionStorage.getItem(GH_CACHE) ?? 'null')
      if (cached && Date.now() - cached.at < 600_000) return setData(cached.data)
    } catch {
      // storage unavailable — just fetch
    }
    const get = (path: string) => fetch(`https://api.github.com/users/${GH_USER}/${path}`).then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    Promise.all([get('repos?per_page=100&sort=pushed'), get('events/public?per_page=100')])
      .then(([repos, events]) => {
        const next = { repos, events }
        setData(next)
        try {
          sessionStorage.setItem(GH_CACHE, JSON.stringify({ at: Date.now(), data: next }))
        } catch {
          // ignore
        }
      })
      .catch(() => setError(true))
  }, [enabled])
  return { data, error }
}

/** GitHub data shaped for the panels: heatmap cells, latest pushes, languages, repo count and last push. */
function useGitHubView(enabled: boolean) {
  const c = useLang().t.ui.lab.mission
  const { data, error } = useGitHub(enabled)

  const ago = (iso: string) => {
    const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
    if (min < 2) return c.ago[0]
    if (min < 60) return `${min} ${c.ago[1]}`
    if (min < 1440) return `${Math.round(min / 60)} ${c.ago[2]}`
    return `${Math.round(min / 1440)} ${c.ago[3]}`
  }

  const view = useMemo(() => {
    if (!data) return null
    const own = data.repos.filter((r) => !r.fork)
    const pushes = data.events.filter((e) => e.type === 'PushEvent')

    // Heatmap: commits per day over the last 52 weeks; repos pushed in that window count when events are sparse.
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dayOf = (iso: string) => Math.floor((today.getTime() - new Date(iso).setHours(0, 0, 0, 0)) / 86400000)
    const days = Array.from({ length: DAYS }, () => 0)
    pushes.forEach((e) => {
      const d = dayOf(e.created_at)
      if (d >= 0 && d < DAYS) days[d] += e.payload.size ?? e.payload.commits?.length ?? 1
    })
    if (pushes.length < 10)
      own.forEach((r) => {
        const d = dayOf(r.pushed_at)
        if (d >= 0 && d < DAYS) days[d] += 1
      })
    const max = Math.max(1, ...days)
    // Oldest first, laid out in week columns.
    const cells = days.map((n) => (n ? Math.ceil((n / max) * 4) : 0)).reverse()

    const feed = pushes.slice(0, 6).map((e) => ({
      repo: e.repo.name.split('/')[1],
      text: e.payload.commits?.[0]?.message.split('\n')[0] ?? `${c.pushed} ${e.payload.ref?.replace('refs/heads/', '') ?? 'main'}`,
      when: ago(e.created_at),
    }))
    // Without push events, fall back to the most recently pushed repos.
    const items = feed.length ? feed : own.slice(0, 6).map((r) => ({ repo: r.name, text: r.description ?? r.language ?? `${c.pushed} main`, when: ago(r.pushed_at) }))

    const counts = new Map<string, number>()
    own.forEach((r) => r.language && counts.set(r.language, (counts.get(r.language) ?? 0) + 1))
    const total = [...counts.values()].reduce((a, b) => a + b, 0) || 1
    const langs = [...counts].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, n]) => ({ name, pct: Math.round((n / total) * 100) }))

    return { repos: own.length, last: own[0] ? { name: own[0].name, when: ago(own[0].pushed_at) } : null, cells, items, langs }
  }, [data, c]) // eslint-disable-line react-hooks/exhaustive-deps

  return { view, error }
}

type GhView = NonNullable<ReturnType<typeof useGitHubView>['view']>

/** Live dot + profile link, shared by Mission control and the bento. */
function GhBar({ live }: { live: boolean }) {
  const c = useLang().t.ui.lab.mission
  return (
    <header className="lab-mc__bar">
      <span className={`lab-mc__live${live ? ' is-on' : ''}`}>{c.live}</span>
      <a href={`https://github.com/${GH_USER}`} target="_blank" rel="noreferrer">
        github.com/{GH_USER}
      </a>
    </header>
  )
}

function GhState({ error }: { error: boolean }) {
  const c = useLang().t.ui.lab.mission
  return (
    <div className="lab-mc__state">
      <p>{error ? c.error : c.loading}</p>
      {error && (
        <a className="lab-btn" href={`https://github.com/${GH_USER}`} target="_blank" rel="noreferrer">
          {c.open}
        </a>
      )}
    </div>
  )
}

function GhStats({ view }: { view: GhView }) {
  const c = useLang().t.ui.lab.mission
  return (
    <section className="lab-mc__panel lab-mc__stats">
      <div>
        <strong>{view.repos}</strong>
        <span>{c.repos}</span>
      </div>
      {view.last && (
        <div>
          <strong>{view.last.name}</strong>
          <span>
            {c.lastPush} · {view.last.when}
          </span>
        </div>
      )}
    </section>
  )
}

function GhHeat({ view }: { view: GhView }) {
  const c = useLang().t.ui.lab.mission
  return (
    <section className="lab-mc__panel lab-mc__heat">
      <h3>{c.activity}</h3>
      <div className="lab-mc__cells">
        {view.cells.map((lvl, i) => (
          <i key={i} data-lvl={lvl} style={{ '--i': i } as CSSProperties} />
        ))}
      </div>
    </section>
  )
}

function GhFeed({ view }: { view: GhView }) {
  const c = useLang().t.ui.lab.mission
  return (
    <section className="lab-mc__panel lab-mc__feed">
      <h3>{c.feed}</h3>
      <ol>
        {view.items.map((it, i) => (
          <li key={i} style={{ '--i': i } as CSSProperties}>
            <span className="lab-mc__repo">{it.repo}</span>
            <span className="lab-mc__msg">{it.text}</span>
            <time>{it.when}</time>
          </li>
        ))}
      </ol>
    </section>
  )
}

function GhLangs({ view }: { view: GhView }) {
  const c = useLang().t.ui.lab.mission
  return (
    <section className="lab-mc__panel lab-mc__langs">
      <h3>{c.languages}</h3>
      <ul>
        {view.langs.map((l, i) => (
          <li key={l.name} style={{ '--i': i, '--pct': `${l.pct}%` } as CSSProperties}>
            <span>{l.name}</span>
            <i />
            <b>{l.pct}%</b>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** My real GitHub activity: a contribution heatmap, the latest pushes and the languages I write. */
export function LabMission() {
  const [ref, seen] = useSeen<HTMLDivElement>(0.1)
  const { view, error } = useGitHubView(seen)
  return (
    <div className="lab-mc" ref={ref}>
      <GhBar live={!!view} />
      {!view ? (
        <GhState error={error} />
      ) : (
        <div className="lab-mc__grid">
          <GhStats view={view} />
          <GhHeat view={view} />
          <GhFeed view={view} />
          <GhLangs view={view} />
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------- 0 · Bento */

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

/**
 * The Lab bento: where I work from (v1 globe + my local time), what I am on right now, what I build with (stack
 * cube), my GitHub graph and a door into the AI assistant. Six tiles, no empty cells at any width.
 */
export function LabBento() {
  const { t } = useLang()
  const b = t.ui.lab.bento
  const [ref, { seen, visible, near }] = useOnScreen<HTMLDivElement>()
  const stage = useWarmStage(near)
  const tools = useMemo(() => new Set(t.roles.flatMap((r) => r.stack)).size, [t.roles])

  return (
    <div className="lab-bento" ref={ref} data-reveal-stagger>
      <article className="lab-bento__tile lab-bento__globe">
        <div className="lab-bento__scene">
          {stage >= 1 && (
            <Suspense fallback={null}>
              <LabGlobe active={visible} />
            </Suspense>
          )}
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
              <TechCubeScene revealed={seen} active={visible} />
            </Suspense>
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

/* -------------------------------------------------- 3 · Build your project */

type Row = { label: string; role?: string; from: number; weeks: number; ongoing?: boolean }

/** Tick what you need; a phased plan, stack and roles assemble themselves. No prices: it opens a conversation. */
export function LabPlan() {
  const c = useLang().t.ui.lab.plan
  const [picked, setPicked] = useState<string[]>(['web', 'auto'])
  const needs = c.needs.filter((n) => picked.includes(n.id))

  // Kickoff, then every chosen phase in sequence, then launch; ongoing work (support) runs on after launch.
  const rows: Row[] = []
  let at = 1
  if (needs.length) rows.push({ label: c.kickoff, from: at++, weeks: 1 })
  const ongoing: Row[] = []
  needs.forEach((n) =>
    n.phases.forEach(([label, weeks]) => {
      if (!weeks) return ongoing.push({ label, role: n.role, from: 0, weeks: 1, ongoing: true })
      rows.push({ label, role: n.role, from: at, weeks })
      at += weeks
    }),
  )
  if (needs.length) rows.push({ label: c.handover, from: at++, weeks: 1 })
  ongoing.forEach((r) => rows.push({ ...r, from: at }))
  const total = at - 1
  const cols = total + (ongoing.length ? 1 : 0)
  const stack = [...new Set(needs.flatMap((n) => n.stack))]

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  return (
    <div className="lab-plan">
      <div className="lab-plan__ask">
        <h3>{c.ask}</h3>
        <div className="lab-plan__needs">
          {c.needs.map((n) => (
            <button key={n.id} className={`lab-plan__need${picked.includes(n.id) ? ' is-on' : ''}`} aria-pressed={picked.includes(n.id)} onClick={() => toggle(n.id)}>
              <i aria-hidden="true" />
              <span>{n.label}</span>
              <small>{n.role}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="lab-plan__out" aria-live="polite">
        {!needs.length ? (
          <p className="lab-plan__empty">{c.empty}</p>
        ) : (
          <>
            <header className="lab-plan__head">
              <h3>{c.plan}</h3>
              <strong>
                ~{total} {c.weeks}
              </strong>
            </header>
            <div className="lab-plan__gantt" style={{ '--cols': cols } as CSSProperties}>
              <div className="lab-plan__weeks" aria-hidden="true">
                {Array.from({ length: cols }, (_, i) => (
                  <span key={i}>{i < total ? `${c.week} ${i + 1}` : '→'}</span>
                ))}
              </div>
              {rows.map((r, i) => (
                <div key={`${r.label}-${i}`} className="lab-plan__row" style={{ '--i': i } as CSSProperties}>
                  <div className="lab-plan__label">
                    {r.label}
                    {r.role && <small>{r.role}</small>}
                  </div>
                  <div className="lab-plan__track">
                    <i className={r.ongoing ? 'is-ongoing' : ''} style={{ gridColumn: `${r.from} / span ${r.weeks}` }}>
                      {/* One-week bars are too short for a label; the week ruler already says it. */}
                      {r.ongoing ? c.ongoing : r.weeks > 1 ? `${r.weeks} ${c.weeks}` : ''}
                    </i>
                  </div>
                </div>
              ))}
            </div>
            <div className="lab-plan__meta">
              <div>
                <h4>{c.stack}</h4>
                <ul>
                  {stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>{c.roles}</h4>
                <ul>
                  {needs.map((n) => (
                    <li key={n.id}>{n.role}</li>
                  ))}
                </ul>
              </div>
            </div>
            <footer className="lab-plan__foot">
              <a className="lab-btn" href="#contact">
                {c.cta} →
              </a>
              <p className="lab-note">{c.note}</p>
            </footer>
          </>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------ 4 · Live incident */

const STEP_MS = 1300
const MTTR = 18

/** A production incident replayed from alert to postmortem, one diagnostic step at a time. */
export function LabIncident() {
  const c = useLang().t.ui.lab.incident
  const n = c.steps.length
  const [ref, seen] = useSeen<HTMLDivElement>()
  const [step, setStep] = useState(-1)
  const [run, setRun] = useState(0)

  useEffect(() => {
    if (!seen) return
    if (prefersReducedMotion()) return setStep(n)
    setStep(0)
    const id = window.setInterval(() => setStep((s) => (s >= n ? (clearInterval(id), s) : s + 1)), STEP_MS)
    return () => clearInterval(id)
  }, [seen, run, n])

  const done = step >= n
  const minutes = done ? MTTR : Math.max(0, Math.round(((step + 1) / n) * MTTR))

  return (
    <div className={`lab-inc${done ? ' is-done' : ''}`} ref={ref}>
      <header className="lab-inc__alert" aria-live="polite">
        <i aria-hidden="true" />
        <span>{done ? `${c.resolved} · ${c.alert.split('·')[1]?.trim() ?? ''}` : c.alert}</span>
        <b>
          T+{minutes} min
        </b>
      </header>

      <ol className="lab-inc__steps">
        {c.steps.map((s, i) => (
          <li key={s.tool} className={i < step || done ? 'is-done' : i === step ? 'is-active' : ''}>
            <span className="lab-inc__tool">{s.tool}</span>
            <div>
              <p>{s.text}</p>
              <code>{s.log}</code>
            </div>
          </li>
        ))}
      </ol>

      <section className={`lab-inc__post${done ? ' is-on' : ''}`}>
        <header>
          <h3>{c.postmortem}</h3>
          <span>
            <strong>{MTTR} min</strong> {c.mttr}
          </span>
        </header>
        <div className="lab-inc__cards">
          {c.post.map(([k, v]) => (
            <div key={k}>
              <h4>{k}</h4>
              <p>{v}</p>
            </div>
          ))}
        </div>
        <button className="lab-btn" onClick={() => setRun((r) => r + 1)}>
          {c.replay}
        </button>
      </section>
    </div>
  )
}
