import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'My Vite PWA',
        short_name: 'VitePWA',
        description: 'This is my awesome Vite app with PWA support!',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/XXX.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/XXX.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
