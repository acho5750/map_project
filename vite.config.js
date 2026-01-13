import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    conditions: ['import', 'module', 'browser', 'default'],
  },
  optimizeDeps: {
    include: ['react-map-gl', 'mapbox-gl'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  define: {
    global: 'globalThis',
  },
})
