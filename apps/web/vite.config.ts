import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import styleX from 'vite-plugin-stylex'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const PORT = parseInt(env.VITE_PORT || '5173')

  return {
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
      styleX()
    ],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: true
    },
    server: {
      port: PORT,
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  }
})

