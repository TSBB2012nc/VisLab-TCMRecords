import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/',
  server: {
    watch: {
      usePolling: true
    }
  },
  publicDir: 'public', // 确保这里指向你的静态文件目录
})
