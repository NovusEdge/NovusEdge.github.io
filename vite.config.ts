import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { vitePrerenderPlugin } from 'vite-prerender-plugin'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    vitePrerenderPlugin({
      renderTarget: '#root',
      prerenderScript: new URL('./src/main.tsx', import.meta.url).pathname,
      additionalPrerenderRoutes: ['/blog', '/portfolio', '/research', '/404'],
    }),
  ],
})
