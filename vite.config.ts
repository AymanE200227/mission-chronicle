import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tsConfigPaths(), tailwindcss(), ...tanstackStart()],
  ssr: {
    external: ["better-sqlite3"],
  },
});
