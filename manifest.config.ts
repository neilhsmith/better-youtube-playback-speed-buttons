import { defineManifest } from "@crxjs/vite-plugin"

export default defineManifest(async () => ({
  manifest_version: 3,
  name: "Better Youtube Playback Speed Buttons",
  version: "1.0.0",
  permissions: ["storage"],
  content_scripts: [
    {
      matches: ["*://*.youtube.com/*"],
      js: ["src/content-script.ts"],
      css: ["src/styles.css"],
    },
  ],
}))
