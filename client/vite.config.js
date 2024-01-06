import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  envDir: './', // Point to the environments directory
  base: process.env.PUBLIC_URL,
})
