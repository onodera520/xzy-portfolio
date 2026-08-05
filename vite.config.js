import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "::1",
    port: 3000,
    strictPort: true,
  },
  preview: {
    host: "::1",
    port: 3000,
    strictPort: true,
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
  },
});
