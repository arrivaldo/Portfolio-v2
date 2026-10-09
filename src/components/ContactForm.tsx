import { useState, type FormEvent } from 'react'
import { useLang } from '../i18n'

// Same EmailJS service and template as v1 (these IDs are public by design; the template decides where mail goes).
const EMAILJS = { service_id: 'service_xi36ze8', template_id: 'template_jrkly5u', user_id: 'sEq9Zuwfom1VxugjE' }

type State = 'idle' | 'sending' | 'sent' | 'error'

export function ContactForm() {
  const { t } = useLang()
  const f = t.ui.form
  const [state, setState] = useState<State>('idle')

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>
    // Honeypot: real people never fill the hidden field.
    if (data.website) return
    delete data.website
    setState('sending')
    try {
      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...EMAILJS, template_params: data }),
      })
      if (!res.ok) throw new Error(await res.text())
      form.reset()
      setState('sent')
    } catch {
      setState('error')
    }
  }

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <h3 className="contact-form__title">{f.title}</h3>
      <div className="contact-form__row">
        <label>
          <span>{f.name}</span>
          <input name="name" required autoComplete="name" maxLength={80} />
        </label>
        <label>
          <span>{f.email}</span>
          <input name="email" type="email" required autoComplete="email" maxLength={120} />
        </label>
      </div>
      <label>
        <span>{f.subject}</span>
        <input name="subject" required maxLength={120} />
      </label>
      <label>
        <span>{f.message}</span>
        <textarea name="message" required rows={5} maxLength={3000} />
      </label>
      <input name="website" className="visually-hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="contact-form__foot">
        <button type="submit" className="contact-form__send" disabled={state === 'sending'} data-magnetic="0.2">
          {state === 'sending' ? f.sending : f.send}
        </button>
        <p className={`contact-form__status is-${state}`} role="status">
          {state === 'sent' ? f.sent : state === 'error' ? f.error : ''}
        </p>
      </div>
    </form>
  )
}
