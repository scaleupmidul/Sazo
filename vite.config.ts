
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
          vendor: ['react', 'react-dom', 'zustand'],
          icons: ['lucide-react'],
          // Split admin pages into a separate chunk so customers don't download admin code
          admin: [
            './pages/admin/AdminDashboardPage',
            './pages/admin/AdminProductsPage', 
            './pages/admin/AdminOrdersPage',
            './pages/admin/AdminSettingsPage',
            './pages/admin/AdminMessagesPage',
            './pages/admin/AdminPaymentInfoPage'
          ]
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
