import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Dev proxy na backend (technicky-navrh.md §4: 5173 → 8000) — cookie
    // ctf_session tak zostáva same-origin. CORS na backendu zostáva pre
    // prípadný hosting frontendu na inom originy.
    proxy: {
      '/api': 'http://127.0.0.1:8000',
      '/login': 'http://127.0.0.1:8000',
      '/logout': 'http://127.0.0.1:8000',
      '/robots.txt': 'http://127.0.0.1:8000',
      '/backup': 'http://127.0.0.1:8000',
      // FastAPI Swagger UI + its OpenAPI spec (participants discover endpoints here)
      '/docs': 'http://127.0.0.1:8000',
      '/openapi.json': 'http://127.0.0.1:8000',
    },
  },
})
