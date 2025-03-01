import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import stylex from 'vite-plugin-stylex'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const PORT = parseInt(env.VITE_PORT || '5173')

  return {
    plugins: [
      react(),
      // Using configuration based on HorusGoul/vite-plugin-stylex
      stylex({
        classNamePrefix: 'cm-',
        // No need for unstable_moduleResolution in the latest version
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
      watch: {
        usePolling: true
      },
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

