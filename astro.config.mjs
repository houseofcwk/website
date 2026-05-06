import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://cwkexperience.com',
  output: 'static',
  integrations: [
    react(),
    sitemap(),
  ],
  vite: {
    // Sanity Studio is a heavy React app mounted client-side only (client:only).
    // Keep its deps external during Astro's SSR build pass so the static site
    // HTML doesn't try to evaluate Studio's Node-incompatible internals.
    ssr: {
      external: ['sanity', '@sanity/vision', 'styled-components'],
    },
  },
});
