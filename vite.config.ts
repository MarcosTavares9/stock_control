import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Para Firebase Hosting, o base deve ser '/'
// Para GitHub Pages, use '/Stock-Control/'
const basePath = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  base: basePath,
  plugins: [react()],
  optimizeDeps: {
    exclude: ['xlsx'],
    include: ['axios'],
  },
  resolve: {
    dedupe: ['axios'],
  },
})

