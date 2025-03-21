import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000", // Flask 后端的地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});

/*
以上配置告诉 Vite，将所有以 /api 开头的请求自动转发到 Flask 后端（例如，/api/test 会被重写为 http://127.0.0.1:5000/test）。这样，你在前端代码中可以用 /api 作为基准路径来访问 Flask API，而不需要在每次请求中写完整的后端 URL。
*/
