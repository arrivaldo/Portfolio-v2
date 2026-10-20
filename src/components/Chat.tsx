import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { useLang } from '../i18n'
import { onIntro } from '../motion'
import { ChatBubble } from './Icons'

type Msg = { role: 'user' | 'model'; text: string; error?: boolean }

const HINT_FOR = 7000 // how long it stays when nobody touches the page
const HINT_IDLE = 6000 // quiet time before it comes back
const HINT_LEAVE = 500 // matches the .is-leaving transition
const DESKTOP = '(min-width: 861px)'

type Hint = { phase: 'off' | 'on' | 'leaving'; round: number }

/**
 * Desktop only: an arrow and a line that draw themselves toward the chat button as soon as the preloader hands over,
 * while the button pulses. Any scroll, click or key sends it away; after HINT_IDLE without activity it comes back
 * and plays again (each round remounts it, so the animation restarts). Never while the chat is open.
 */
function useHint(open: boolean) {
  const [hint, setHint] = useState<Hint>({ phase: 'off', round: 0 })
  const openRef = useRef(open)
  openRef.current = open
  const hideRef = useRef<() => void>(() => {})

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP)
    let started = false
    let stay = 0
    let idle = 0
    let gone = 0
    const later = (fn: () => void, ms: number) => window.setTimeout(fn, ms)

    const show = () => {
      if (!mq.matches || openRef.current) return wait()
      clearTimeout(gone)
      setHint((h) => ({ phase: 'on', round: h.round + 1 }))
      stay = later(hide, HINT_FOR)
    }
    const hide = () => {
      clearTimeout(stay)
      setHint((h) => (h.phase === 'on' ? { ...h, phase: 'leaving' } : h))
      gone = later(() => setHint((h) => (h.phase === 'leaving' ? { ...h, phase: 'off' } : h)), HINT_LEAVE)
      wait()
    }
    // (Re)starts the quiet-time countdown before the next round.
    const wait = () => {
      clearTimeout(idle)
      idle = later(show, HINT_IDLE)
    }
    hideRef.current = hide

    const onActivity = () => {
      if (!started) return
      hide()
    }
    const events = ['scroll', 'wheel', 'pointerdown', 'keydown', 'touchstart'] as const
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true, capture: true }))
    onIntro(() => {
      started = true
      show()
    })
    return () => {
      clearTimeout(stay)
      clearTimeout(idle)
      clearTimeout(gone)
      events.forEach((e) => window.removeEventListener(e, onActivity, { capture: true }))
    }
  }, [])

  useEffect(() => {
    if (open) hideRef.current()
  }, [open])
  return hint
}

/** "Ask my portfolio": an LLM assistant grounded in data.ts, served by /api/chat. */
export function Chat() {
  const { lang, t } = useLang()
  const c = t.ui.chat
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const body = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const fab = useRef<HTMLButtonElement>(null)
  const hint = useHint(open)

  useEffect(() => {
    body.current?.scrollTo({ top: body.current.scrollHeight, behavior: 'smooth' })
  }, [msgs, busy])

  useEffect(() => {
    if (open) input.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const ask = async (question: string) => {
    const q = question.trim()
    if (!q || busy) return
    const history = msgs.filter((m) => !m.error).map(({ role, text }) => ({ role, text }))
    setMsgs((m) => [...m, { role: 'user', text: q }])
    setValue('')
    setBusy(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question: q, lang, history }),
      })
      const data = (await res.json().catch(() => ({}))) as { answer?: string; error?: string }
      if (data.answer) setMsgs((m) => [...m, { role: 'model', text: data.answer! }])
      else {
        const text = data.error === 'busy' || data.error === 'rate_limited' ? c.errors.busy : data.error === 'not_configured' ? c.errors.offline : c.errors.generic
        setMsgs((m) => [...m, { role: 'model', text, error: true }])
      }
    } catch {
      setMsgs((m) => [...m, { role: 'model', text: c.errors.offline, error: true }])
    } finally {
      setBusy(false)
    }
  }

  // Other parts of the page (the Lab bento) can open the chat, optionally with a question: dispatch `chat:ask`.
  const askRef = useRef(ask)
  askRef.current = ask
  useEffect(() => {
    const onAsk = (e: Event) => {
      setOpen(true)
      const q = (e as CustomEvent<string | undefined>).detail
      if (q) askRef.current(q)
    }
    window.addEventListener('chat:ask', onAsk)
    return () => window.removeEventListener('chat:ask', onAsk)
  }, [])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    ask(value)
  }

  return (
    <>
      {hint.phase !== 'off' && (
        <div key={hint.round} className={`chat-hint is-${hint.phase}`} style={{ '--fab-w': `${fab.current?.offsetWidth ?? 260}px` } as CSSProperties} aria-hidden="true">
          <span className="chat-hint__text">{c.hint}</span>
        </div>
      )}
      <button ref={fab} className={`chat-fab${open ? ' is-hidden' : ''}${hint.phase === 'on' ? ' is-hinting' : ''}`} onClick={() => setOpen(true)} aria-expanded={open} aria-controls="chat-panel" data-magnetic="0.3">
        <span className="chat-fab__dot" aria-hidden="true" />
        <ChatBubble className="chat-fab__icon" />
        <span className="chat-fab__label">{c.open}</span>
      </button>

      <section id="chat-panel" className={`chat${open ? ' is-open' : ''}`} aria-label={c.title} aria-hidden={!open} data-lenis-prevent>
        <header className="chat__head">
          <strong>{c.title}</strong>
          <button className="chat__close" onClick={() => setOpen(false)} aria-label={c.close} tabIndex={open ? 0 : -1}>
            ✕
          </button>
        </header>

        <div className="chat__body" ref={body} aria-live="polite">
          <p className="chat__msg chat__msg--model">{c.intro}</p>
          {msgs.map((m, i) => (
            <p key={i} className={`chat__msg chat__msg--${m.role}${m.error ? ' is-error' : ''}`}>
              {m.text}
            </p>
          ))}
          {busy && <p className="chat__msg chat__msg--model is-thinking">{c.thinking}</p>}
          {msgs.length === 0 && (
            <div className="chat__suggestions">
              {c.suggestions.map((s) => (
                <button key={s} onClick={() => ask(s)} tabIndex={open ? 0 : -1}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <form className="chat__form" onSubmit={onSubmit}>
          <input
            ref={input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={c.placeholder}
            maxLength={500}
            aria-label={c.placeholder}
            tabIndex={open ? 0 : -1}
          />
          <button type="submit" disabled={busy || !value.trim()} tabIndex={open ? 0 : -1}>
            {c.send}
          </button>
        </form>
      </section>
    </>
  )
}
