import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  css: { postcss: true },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
  build: {
    chunkSizeWarningLimit: 1500,
    minify: 'esbuild',
    sourcemap: false, // Disable sourcemaps for production builds to avoid warnings
    reportCompressedSize: false, // Disable compressed size reporting to reduce output
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'vendor_react'
            if (id.includes('@tanstack') || id.includes('react-query')) return 'vendor_tanstack'
            if (id.includes('framer-motion')) return 'vendor_motion'
            if (id.includes('@heroicons')) return 'vendor_icons'
            if (id.includes('axios')) return 'vendor_axios'
            if (id.includes('react-router')) return 'vendor_router'
            return 'vendor'
          }
        }
      },
      // Suppress rollup warnings
      onwarn(warning, warn) {
        // Suppress sourcemap warnings
        if (warning.code === 'SOURCEMAP_ERROR') return
        warn(warning)
      }
    }
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
    // Reduce memory usage and processing
    target: 'es2020',
    minify: false,
    sourcemap: false, // Disable sourcemaps completely to avoid warnings
    logLevel: 'silent', // Reduce esbuild logging
  },
  optimizeDeps: {
    // Pre-bundle fewer dependencies to reduce memory usage
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'axios',
      'maplibre-gl'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  // Reduce file watching to prevent overwhelming the system
  watch: {
    ignored: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.git/**',
      '**/coverage/**'
    ]
  }
}))
