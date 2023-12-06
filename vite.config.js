import { defineConfig } from "vite"
import { crx } from "@crxjs/vite-plugin"
import defineManifest from "./manifest.config"

export default defineConfig({
  plugins: [crx({ manifest: defineManifest })],
})
