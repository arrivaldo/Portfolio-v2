import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

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

export default defineConfig({
  plugins: [react(), devApi()],
  resolve: {
    // Code the 3D libraries import but the site never runs (see each stub): keeps it out of the Lab chunks.
    alias: [
      { find: /^three\/webgpu$/, replacement: stub('three-webgpu.ts') },
      { find: /^three\/tsl$/, replacement: stub('three-tsl.ts') },
      { find: /^n8ao$/, replacement: stub('n8ao.ts') },
      { find: /^h3-js$/, replacement: stub('h3.ts') },
    ],
  },
})
