import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  // 👇 Tell Vite where index.html lives
  root: "client",

  server: {
    host: "::",
    port: 8080,
    // 👇 KEY CHANGE: Use proxy instead of expressPlugin
    proxy: {
      "/api": {
        target: "http://localhost:5000", // Make sure your server.js runs on this port
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      allow: [
        path.resolve(__dirname, "client"),
        path.resolve(__dirname, "shared"),
      ],
      deny: [
        ".env",
        ".env.*",
        "*.{crt,pem}",
        "**/.git/**",
        "server/**", // Good practice: keep server code inaccessible
      ],
    },
  },

  build: {
    outDir: "../dist/spa",
    emptyOutDir: true,
  },

  plugins: [
    react(),
    // expressPlugin() removed to prevent the "require" crash
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
});