/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** Mock /api/auth and /api/auth-verify for local dev (harness). */
function devAuthApi() {
  return {
    name: 'dev-auth-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'POST') return next()

        if (req.url === '/api/auth') {
          let body = ''
          req.on('data', c => (body += c))
          req.on('end', () => {
            res.setHeader('Content-Type', 'application/json')
            const token = Buffer.from(`dev:${Date.now()}`).toString('base64')
            res.end(JSON.stringify({ token, expiresAt: Date.now() + 86400000 }))
          })
          return
        }

        if (req.url === '/api/auth-verify') {
          let body = ''
          req.on('data', c => (body += c))
          req.on('end', () => {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ valid: true }))
          })
          return
        }

        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), devAuthApi()],
  test: {
    include: ['src/**/__tests__/**/*.test.ts'],
  },
})
