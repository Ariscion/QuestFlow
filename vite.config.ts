import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: false,
      devOptions: {
        enabled: true, // Включаем генерацию PWA-манифеста в DEV-режиме
        type: 'module',
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('/firebase/') || id.includes('/@firebase/')) return 'firebase'
          if (id.includes('/react-router-dom/') || id.includes('/react-router/') || id.includes('/@remix-run/router/')) return 'router'
          if (id.includes('/react/') || id.includes('/react-dom/')) return 'react'
          return undefined
        }
      }
    }
  },
  server: {
    proxy: {
      '/api/steam': {
        target: 'https://store.steampowered.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/steam/, '/api')
      },
      '/api/itad': {
        target: 'https://api.isthereanydeal.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/itad/, '')
      }
    }
  }
})