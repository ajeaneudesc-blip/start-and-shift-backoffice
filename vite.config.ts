import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // 5173 est l'origine autorisée par ALLOWED_ORIGINS côté API : on la fige
  // pour ne pas se retrouver bloqué par le CORS si le port est déjà pris.
  server: { port: 5173, strictPort: true },
})
