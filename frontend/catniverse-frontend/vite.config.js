import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  root: 'test',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2000000, 
    outDir: 'build',
  },
  
  server: {
    host: '140.136.151.71',  
    port: 5173,          
  }
})
