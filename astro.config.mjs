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
});
