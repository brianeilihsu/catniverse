import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2000000, 
    outDir: 'build',
  },
  
  server: {
    host: '172.20.10.4',  
    port: 5173,          
  }
})
