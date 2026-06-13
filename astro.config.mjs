// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import react from '@astrojs/react';
import node from '@astrojs/node';

export default defineConfig({
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  site: 'https://linkedintoolkit.com',
  redirects: {
    '/tools/linkedin-text-formatter/': '/linkedin-text-formatter/',
    '/tools/linkedin-post-preview/': '/linkedin-post-preview/',
    '/tools/linkedin-character-counter/': '/linkedin-character-counter/',
    '/tools/linkedin-headline-analyzer/': '/linkedin-headline-analyzer/',
    '/tools/linkedin-hashtag-generator/': '/linkedin-hashtag-generator/',
    '/tools/linkedin-emoji-adder/': '/linkedin-emoji-adder/',
    '/tools/linkedin-connection-message-templates/': '/linkedin-connection-message-templates/',
    '/tools/linkedin-about-section-templates/': '/linkedin-about-section-templates/',
  },
  integrations: [
    tailwind(),

    react(),
  ],
});
