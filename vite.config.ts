import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const basePath = process.env.VITE_BASE_PATH || '/Stock-Control/'

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

