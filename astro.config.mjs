import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://cwkexperience.com',
  output: 'static',
  adapter: cloudflare(),
  integrations: [
    react(),
    sitemap(),
  ],
  vite: {
    resolve: {
      // Use the edge variant of react-dom/server — designed for Cloudflare Workers,
      // Deno Deploy, and other edge runtimes. Avoids the MessageChannel dependency
      // that the browser variant calls at module initialization time.
      alias: {
        'react-dom/server': 'react-dom/server.edge',
      },
    },
  },
});
