import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api-fonnte': {
        target: 'https://api.fonnte.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-fonnte/, ''),
        headers: {
          cookie: '',
        },
      },
      '/api-wablas': {
        target: 'https://kudus.wablas.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-wablas/, ''),
        headers: {
          cookie: '',
        },
      },
    },
  },
})
