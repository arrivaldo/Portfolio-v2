import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { content } from './src/data'

const stub = (file: string) => fileURLToPath(new URL(`./src/stubs/${file}`, import.meta.url))

/** Serves the Vercel functions in /api during `npm run dev`, so the chat works locally. */
function devApi(): Plugin {
  return {
    name: 'dev-api',
    configureServer(server) {
      Object.assign(process.env, loadEnv('development', process.cwd(), ''))
      server.middlewares.use('/api/chat', async (req, res) => {
        const chunks: Buffer[] = []
        for await (const c of req) chunks.push(c as Buffer)
        const { POST } = await server.ssrLoadModule('/api/chat.ts')
        const request = new Request('http://localhost/api/chat', {
          method: req.method,
          headers: req.headers as Record<string, string>,
          body: req.method === 'POST' ? Buffer.concat(chunks) : undefined,
        })
        const response: Response = await POST(request)
        res.statusCode = response.status
        res.setHeader('content-type', response.headers.get('content-type') ?? 'application/json')
        res.end(await response.text())
      })
    },
  }
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/**
 * Writes es/index.html next to index.html: the same page with Spanish <html lang>, title, description, canonical and
 * link-preview tags, so search engines and LinkedIn/WhatsApp previews (which don't run JS) see /es in Spanish.
 */
function spanishPage(): Plugin {
  return {
    name: 'spanish-page',
    apply: 'build',
    // After the files are on disk: Vite writes index.html in its own late hook, so it isn't in the bundle any earlier.
    writeBundle({ dir }) {
      const out = dir ?? 'dist'
      const { title, description } = content.es.meta
      const t = escapeHtml(title)
      const d = escapeHtml(description)
      const rules: [RegExp, string][] = [
        [/<html lang="en">/, '<html lang="es">'],
        [/<title>[^<]*<\/title>/, `<title>${t}</title>`],
        [/(<meta name="description" content=")[^"]*/, `$1${d}`],
        [/(<meta property="og:title" content=")[^"]*/, `$1${t}`],
        [/(<meta property="og:description" content=")[^"]*/, `$1${d}`],
        [/(<link rel="canonical" href=")([^"]*?)\/?"/, '$1$2/es"'],
        [/(<meta property="og:url" content=")([^"]*?)\/?"/, '$1$2/es"'],
        [/(<meta property="og:locale" content=")en_US/, '$1es_MX'],
        [/(<meta property="og:locale:alternate" content=")es_MX/, '$1en_US'],
      ]
      let html = readFileSync(join(out, 'index.html'), 'utf8')
      for (const [find, replace] of rules) {
        if (!find.test(html)) this.error(`spanish-page: ${find} not found in index.html`)
        html = html.replace(find, replace)
      }
      mkdirSync(join(out, 'es'), { recursive: true })
      writeFileSync(join(out, 'es', 'index.html'), html)
    },
  }
}

export default defineConfig({
  plugins: [react(), devApi(), spanishPage()],
  resolve: {
    // Code the 3D libraries import but the site never runs (see each stub): keeps it out of the Lab chunks.
    alias: [
      { find: /^three\/webgpu$/, replacement: stub('three-webgpu.ts') },
      { find: /^three\/tsl$/, replacement: stub('three-tsl.ts') },
      { find: /^h3-js$/, replacement: stub('h3.ts') },
    ],
  },
})
