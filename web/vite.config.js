import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    middlewareMode: true,
  },
  appType: "custom",
  ssr: {
    // react-helmet-async ships a CJS "main" entry that Node's SSR module
    // loader can't destructure named exports from. Forcing it through
    // Vite's own SSR transform (instead of a raw Node require) fixes it.
    noExternal: ["react-helmet-async"],
  },
});
