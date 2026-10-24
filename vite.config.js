import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Firebase en su propio chunk
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // React y router en un chunk base
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Utilidades
          utils: ['date-fns', 'xlsx', 'react-hook-form', 'react-hot-toast'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
