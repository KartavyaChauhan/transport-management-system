import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 1. Force Vite to pre-bundle these dependencies
  optimizeDeps: {
    include: ['@apollo/client', 'graphql'],
  },
  // 2. Allow mixed (CommonJS + ESM) modules to work together
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
})