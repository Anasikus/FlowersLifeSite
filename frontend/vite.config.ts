import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Прокси для всех запросов, начинающихся с /api или /admin
      '/api': 'http://localhost:4000',
      '/admin': 'http://localhost:4000'
    }
  }
});
