import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  base: "VisLab-TCMRecords",
  plugins: [vue()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    outDir: "../docs",
  },
});

