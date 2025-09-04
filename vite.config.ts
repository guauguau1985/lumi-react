import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'   // <— aquí el plugin normal
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  }
})
