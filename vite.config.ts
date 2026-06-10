import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  resolve: {
    alias: {
      '@/app': fileURLToPath(new URL('./src/app', import.meta.url)),
      '@/pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@/widgets': fileURLToPath(new URL('./src/widgets', import.meta.url)),
      '@/features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@/entities': fileURLToPath(new URL('./src/entities', import.meta.url)),
      '@/shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
    }
  },
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
      '/api/steam-reviews': {
        target: 'https://store.steampowered.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/steam-reviews/, '/appreviews')
      },
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