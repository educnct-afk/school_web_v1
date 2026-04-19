import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(new URL('.', import.meta.url).pathname, 'src'),
      '@core': path.resolve(new URL('.', import.meta.url).pathname, 'src/core'),
      '@modules': path.resolve(new URL('.', import.meta.url).pathname, 'src/modules'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
