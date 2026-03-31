import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'LeadFlow',
        short_name: 'LeadFlow',
        description: 'Never miss another lead. Instant SMS follow-up for your business.',
        theme_color: '#0a0b0e',
        background_color: '#0a0b0e',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/app',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // Cache the app shell and static assets
        globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
        // Don't cache API calls or Supabase requests
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/lead\//],
        runtimeCaching: [
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    port: 5174
  }
})
