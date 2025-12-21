import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  css: {
    postcss: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor_react'
            }
            if (id.includes('@tanstack') || id.includes('react-query')) {
              return 'vendor_tanstack'
            }
            if (id.includes('framer-motion')) {
              return 'vendor_motion'
            }
            if (id.includes('@heroicons')) {
              return 'vendor_icons'
            }
            if (id.includes('axios')) {
              return 'vendor_axios'
            }
            if (id.includes('react-router')) {
              return 'vendor_router'
            }
            return 'vendor'
          }
        }
      }
    }
  }
}))
