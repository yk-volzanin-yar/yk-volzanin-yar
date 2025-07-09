import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/yk-volzanin-yar/',
  plugins: [react()],
  resolve: {
    alias: {
      '@general': '/src/general',
    },
  },
});