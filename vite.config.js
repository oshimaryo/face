import { defineConfig } from 'vite'
import webExtension from 'vite-plugin-web-extension'

export default defineConfig({
  plugins: [
    webExtension({
      manifest: './src/manifest.json',
      additionalInputs: [
        'src/popup/settings.html'
      ]
    })
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        'content-scripts/face': 'src/content-scripts/face.js',
        'popup/settings': 'src/popup/settings.js'
      }
    }
  }
})