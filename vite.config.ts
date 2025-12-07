
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-core': ['react', 'react-dom'],
          'app-state': ['zustand'],
          'ui-icons': ['lucide-react'], 
          'utils': ['bcryptjs'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
