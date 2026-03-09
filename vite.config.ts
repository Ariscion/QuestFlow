import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/steam': {
        target: 'https://store.steampowered.com',
        changeOrigin: true, // Этого достаточно, Vite сам подменит хост
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/steam/, '/api')
      }
    }
  }
})