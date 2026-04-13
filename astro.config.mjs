import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProd = process.argv.includes('build');

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
      alias: {
        // Dev:  Vite's ESM SSR runner can't run CJS require() — use our ESM shim
        //       that loads react-dom/server.edge via createRequire (Node-only).
        // Prod: Vite bundles the CJS file natively during build, so point directly
        //       at server.edge (avoids createRequire in the Workers bundle where
        //       import.meta.url is undefined).
        'react-dom/server': isProd
          ? 'react-dom/server.edge'
          : resolve(__dirname, 'src/shims/react-dom-server-edge.mjs'),
      },
    },
  },
});
