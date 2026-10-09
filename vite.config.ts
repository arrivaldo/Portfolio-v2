import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

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
})
