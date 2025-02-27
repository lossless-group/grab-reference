import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import styleX from '@stylexjs/rollup-plugin';

export default defineConfig({
  plugins: [react(), styleX({
    dev: true,
    runtimeInjection: true,
    styleResolution: 'application-order'
  })],
  server: {
    port: 5173,
    host: true,
    watch: {
      usePolling: true
    }
  },
  preview: {
    port: 5173,
    host: true
  }
});

