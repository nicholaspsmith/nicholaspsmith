import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://nicholaspsmith.com',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    sitemap({ filter: (page) => !page.includes('/mac-classic') && !page.includes('/404') }),
  ],
});
