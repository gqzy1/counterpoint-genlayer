import { defineConfig } from 'vite';
export default defineConfig({base:'./',server:{allowedHosts:['terminal.local']},build:{chunkSizeWarningLimit:900,rollupOptions:{output:{manualChunks:{sculpture:['three'],genlayer:['genlayer-js']}}}}});
