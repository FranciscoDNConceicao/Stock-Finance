import { fileURLToPath } from 'node:url'

export default {
  plugins: {
    // Resolve the config next to this file, so it works no matter where Vite is started from.
    tailwindcss: { config: fileURLToPath(new URL('./tailwind.config.js', import.meta.url)) },
    autoprefixer: {},
  },
}
