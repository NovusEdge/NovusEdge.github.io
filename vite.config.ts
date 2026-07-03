import { createRequire } from 'node:module'
import { readdirSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { vitePrerenderPlugin } from 'vite-prerender-plugin'

const require = createRequire(import.meta.url)

const blogSlugs = readdirSync('src/content/blog')
  .filter((f) => f.endsWith('.md'))
  .map((f) => f.replace(/\.md$/, ''))

export default defineConfig({
  resolve: {
    alias: {
      // its browser build touches document at import time and crashes prerendering;
      // hoisted via .npmrc so the Node build resolves from the project root
      'decode-named-character-reference': require.resolve('decode-named-character-reference'),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    vitePrerenderPlugin({
      renderTarget: '#root',
      prerenderScript: new URL('./src/main.tsx', import.meta.url).pathname,
      additionalPrerenderRoutes: [
        '/blog', '/portfolio', '/research', '/404',
        ...blogSlugs.map((s) => `/blog/${s}`),
      ],
    }),
  ],
})
