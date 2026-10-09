import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useLang } from '../i18n'

type Msg = { role: 'user' | 'model'; text: string; error?: boolean }

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

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    ask(value)
  }

  return (
    <>
      <button className={`chat-fab${open ? ' is-hidden' : ''}`} onClick={() => setOpen(true)} aria-expanded={open} aria-controls="chat-panel" data-magnetic="0.3">
        <span className="chat-fab__dot" aria-hidden="true" />
        {c.open}
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
