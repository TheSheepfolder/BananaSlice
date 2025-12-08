import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    // Prevent Vite from clearing the screen
    clearScreen: false,
    // Tauri dev server configuration
    server: {
        port: 5173,
        strictPort: true,
    },
    // Build configuration
    build: {
        // Tauri uses Rust for minification
        minify: process.env.TAURI_ENV_DEBUG ? false : 'esbuild',
        // Produce sourcemaps for debug builds
        sourcemap: !!process.env.TAURI_ENV_DEBUG,
    },
});
