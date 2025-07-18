import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

//https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Configura o proxy para redirecionar requisições para /api para o backend
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false, // false p http e tru p https
      },
    },
    port: 5173, //frontend
  },
});