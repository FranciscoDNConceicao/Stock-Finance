import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import generouted from '@generouted/react-router/plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), generouted()],
  build: {
    target: 'esnext' //browsers can handle the latest ES features
  }
})
