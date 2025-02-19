import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
plugins: [
  react({
    babel: {
      plugins: [
        ['@stylexjs/babel-plugin', {
          dev: true,
          // Required for CSS variable support
          runtime: true,
          // Required for dynamic styles
          genConditionalClasses: true,
          styleResolution: 'application-order',
          unstable_moduleResolution: {
            type: 'commonJS',
            rootDir: __dirname,
          },
        }],
      ],
    },
  }),
],
build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true
},
server: {
    port: 3000,
    host: true
}
})

