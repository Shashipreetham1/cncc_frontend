// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc' // Using faster SWC plugin
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Frontend dev server port
    open: true,
    // Proxy is removed as the Play CDN method doesn't involve a Node build step
    // where process.env could be easily read via loadEnv for the target.
    // Direct API calls to VITE_API_BASE_URL are expected.
  },
   resolve: {
    // Optional alias for cleaner imports
    alias: {
        '@': path.resolve(__dirname, './src'),
    },
   },
})