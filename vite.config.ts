import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// Client build: a tiny vanilla "islands" bundle (theme toggle, code copy, hero graph animation).
// Pages themselves are React components rendered to static HTML at build time (scripts/prerender.mjs).
export default defineConfig(({isSsrBuild}) => ({
  plugins: [react()],
  publicDir: isSsrBuild ? false : 'public',
  build: isSsrBuild
    ? {outDir: '.ssr', emptyOutDir: true, ssr: 'src/entry-server.tsx', rolldownOptions: {output: {format: 'es', entryFileNames: 'entry-server.mjs'}}}
    : {
        outDir: 'dist', emptyOutDir: true, manifest: true, cssCodeSplit: false, target: 'es2020',
        rolldownOptions: {input: 'src/client/main.ts'},
      },
}))
