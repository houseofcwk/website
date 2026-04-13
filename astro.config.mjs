import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://houseofcwk.com',
  output: 'server',
  adapter: cloudflare(),
  integrations: [
    react(),
    sitemap(),
  ],
  vite: {
    resolve: {
      // react-dom/server browser build calls MessageChannel at init time,
      // which is not available in the Cloudflare Workers runtime.
      // The edge variant is designed for Workers/Deno and avoids this.
      alias: {
        'react-dom/server': 'react-dom/server.edge',
      },
    },
  },
});
