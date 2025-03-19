import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist/renderer', // Output directory for the frontend build
    emptyOutDir: true,       // Clear the output directory before building
  },
  server: {
    port: 5173,
  },
})
