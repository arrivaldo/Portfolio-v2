// "Ask my portfolio" — Vercel function (Web Request/Response). Also served in dev by the plugin in vite.config.ts.
// Needs GEMINI_API_KEY in the environment (Vercel project settings, or .env.local for `npm run dev`).
import { content, type Lang } from '../src/data.js'

const MODEL = 'gemini-3.5-flash'
const MAX_QUESTION = 500
const MAX_TURNS = 6

const SYSTEM_PROMPT = `You are the assistant on Erick Rodríguez Bárcena's portfolio and you answer as Erick, in first person.
Rules:
- Reply in the same language as the user.
- Be concise: normally under 90 words. Elaborate only if asked.
- Use ONLY the profile below. If something is not there, say you don't have that detail and suggest the Contact section or LinkedIn.
- Do not invent numbers, clients, employers or dates.
- Never share details about current or past employers beyond what the profile says (internal data is confidential).
- Plain text only, no markdown.
- If asked how to get in touch, point to the contact form on this page, LinkedIn or WhatsApp.`

const strip = (s: string) => s.replace(/\*/g, '').replace(/\n/g, ' ')

/** The whole profile fits comfortably in context, so it is sent every time (no retrieval needed). */
function profile(): string {
  const t = content.en
  return [
    `NAME: ${t.profile.fullName}. Based in ${t.profile.city}. ${t.profile.status}.`,
    `SUMMARY: ${strip(t.profile.intro)} ${strip(t.profile.goal)}`,
    `ROLES:\n${t.roles.map((r) => `- ${r.title}: ${r.description} Stack: ${r.stack.join(', ')}.`).join('\n')}`,
    `EXPERIENCE:\n${t.jobs.map((j) => `- ${j.period} · ${j.company} · ${j.role}${j.highlights.length ? `: ${j.highlights.join(' ')}` : ''}`).join('\n')}`,
    `FEATURED PROJECTS:\n${t.projects
      .map((p) => `- ${p.title} (${p.stack.join(', ')}): ${p.summary} Problem: ${p.story.problem} Solution: ${p.story.solution} Result: ${p.story.result} Link: ${p.href}`)
      .join('\n')}`,
    `OTHER PROJECTS:\n${t.archive.map((a) => `- ${a.name} (${a.tagline}): ${a.description}`).join('\n')}`,
    `SKILLS:\n${Object.entries(t.skillGroups).map(([g, items]) => `- ${g}: ${items.join(', ')}`).join('\n')}`,
    `EDUCATION: ${t.education.join('; ')}. CERTIFICATIONS: ${t.certifications.join('; ')}.`,
    `NOW: ${t.now.map((n) => `${n.label}: ${n.text}`).join(' ')}`,
  ].join('\n\n')
}

type Turn = { role: 'user' | 'model'; text: string }

// Best-effort abuse guard: a few questions per minute per IP (per warm instance).
const hits = new Map<string, number[]>()
function limited(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > 8
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

export async function POST(req: Request): Promise<Response> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return json({ error: 'not_configured' }, 503)

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'local'
  if (limited(ip)) return json({ error: 'rate_limited' }, 429)

  let body: { question?: unknown; lang?: unknown; history?: unknown }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'bad_request' }, 400)
  }
  const question = typeof body.question === 'string' ? body.question.trim().slice(0, MAX_QUESTION) : ''
  if (!question) return json({ error: 'bad_request' }, 400)
  const lang: Lang = body.lang === 'es' ? 'es' : 'en'
  const history = (Array.isArray(body.history) ? body.history : [])
    .filter((h): h is Turn => !!h && (h.role === 'user' || h.role === 'model') && typeof h.text === 'string')
    .slice(-MAX_TURNS)
    .map((h) => ({ role: h.role, parts: [{ text: h.text.slice(0, 1200) }] }))

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: `${SYSTEM_PROMPT}\nThe visitor is browsing in ${lang === 'es' ? 'Spanish' : 'English'}.\n\nPROFILE\n${profile()}` }] },
      contents: [...history, { role: 'user', parts: [{ text: question }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 400, thinkingConfig: { thinkingBudget: 0 } },
    }),
  })

  if (!res.ok) return json({ error: res.status === 429 || res.status === 503 ? 'busy' : 'upstream' }, 502)
  const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
  const answer = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('').replace(/\*/g, '').trim()
  return answer ? json({ answer }) : json({ error: 'empty' }, 502)
}
