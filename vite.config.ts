
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
          // Keep core dependencies in vendor, but pages will now be auto-split by React.lazy
          vendor: ['react', 'react-dom', 'zustand', 'lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
