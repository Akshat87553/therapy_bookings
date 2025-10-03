import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
    server: {
    host: true, // 👈 allows access from network
    port: 5173, // you can change port if needed
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
