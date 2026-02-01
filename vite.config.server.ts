import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    ssr: true,
    target: "node22",

    lib: {
      entry: path.resolve(__dirname, "server/node-build.ts"),
      fileName: "production",
      formats: ["es"],
    },

    outDir: "dist/server",
    emptyOutDir: true,

    rollupOptions: {
      preserveEntrySignatures: "strict",

      external: [
        // Node built-ins
        "fs",
        "path",
        "url",
        "http",
        "https",
        "os",
        "crypto",
        "stream",
        "util",
        "events",
        "buffer",
        "querystring",
        "child_process",

        // External deps
        "express",
        "cors",
      ],

      output: {
        format: "es",
        entryFileNames: "[name].mjs",
      },
    },

    minify: false,
    sourcemap: true,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },

  define: {
    "process.env.NODE_ENV": '"production"',
  },
});
