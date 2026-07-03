import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import obfuscateCode from 'javascript-obfuscator'

function obfuscatePlugin() {
  return {
    name: 'obfuscate',
    renderChunk(code) {
      return obfuscateCode.obfuscate(code, {
        compact: true,
        stringArray: true,
        rotateStringArray: true,
      }).getObfuscatedCode()
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), obfuscatePlugin()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: true },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/auth': { target: 'http://localhost:5000', changeOrigin: true },
      '/products': { target: 'http://localhost:5000', changeOrigin: true },
      '/orders': { target: 'http://localhost:5000', changeOrigin: true },
      '/users': { target: 'http://localhost:5000', changeOrigin: true },
      '/plans': { target: 'http://localhost:5000', changeOrigin: true },
      '/testimonials': { target: 'http://localhost:5000', changeOrigin: true },
      '/faq': { target: 'http://localhost:5000', changeOrigin: true },
      '/settings': { target: 'http://localhost:5000', changeOrigin: true },
      '/dashboard': { target: 'http://localhost:5000', changeOrigin: true },
      '/ai': { target: 'http://localhost:5000', changeOrigin: true },
      '/mobile': { target: 'http://localhost:5000', changeOrigin: true },
      '/api/download': { target: 'http://localhost:5000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
})
