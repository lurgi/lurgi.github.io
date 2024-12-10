import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import svgr from "vite-plugin-svgr";
import remarkGfm from "remark-gfm";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mdx({ remarkPlugins: [remarkGfm] }), svgr()],
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        inlineDynamicImports: false,
      },
    },
  },
});
