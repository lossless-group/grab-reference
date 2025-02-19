import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import styleX from '@stylexjs/rollup-plugin';

export default defineConfig({
plugins: [
    react(),
    styleX({
    // StyleX options
    dev: process.env.NODE_ENV === 'development',
    runtimeInjection: true,
    assumeProductionMode: process.env.NODE_ENV === 'production',
    })
],
server: {
    port: 3000
}
});

