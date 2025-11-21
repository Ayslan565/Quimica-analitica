import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // AQUI ESTÁ A MÁGICA:
    proxy: {
      // Quando o site pedir "/experimental", o Vite redireciona para o Python (8000)
      '/experimental': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      // Adicionando a rota antiga de titulação também, por garantia
      '/titulacao': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})