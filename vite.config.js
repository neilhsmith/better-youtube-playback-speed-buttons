import { resolve } from "path"
import { defineConfig } from "vite"

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/content-script.ts"),
      name: "ContentScript",
      fileName: "content-script",
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
  },
})
