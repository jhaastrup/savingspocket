// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Correct import for v4

export default defineConfig({
  plugins: [react(), tailwindcss(),],// Correct usage as a Vite plugin
  build: {
    target: 'esnext', // <--- Add this line
  },
  base: '/',
})

