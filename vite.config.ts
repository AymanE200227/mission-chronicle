import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tsConfigPaths(), tailwindcss(), ...tanstackStart(), react()],
  ssr: {
    external: ["better-sqlite3"],
  },
});
