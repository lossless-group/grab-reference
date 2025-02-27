import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

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
              runtime: true,
              styleResolution: 'application-order'
            }]
          ]
        }
      })
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
    },
    preview: {
      port: PORT,
      host: true
    }
  }
})

