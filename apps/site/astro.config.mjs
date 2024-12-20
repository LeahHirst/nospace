// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import partytown from '@astrojs/partytown';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://nospacelang.org',
  integrations: [
    react(),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
    starlight({
      title: 'Nospace: Documentation',
      customCss: ['./src/styles/starlight.css'],
      head: [
        {
          tag: 'script',
          attrs: {
            src: 'https://www.googletagmanager.com/gtag/js?id=G-05ZJ9FXQC2',
            async: true,
          },
        },
      ],
      logo: {
        replacesTitle: true,
        src: './src/assets/logo-dark.svg',
      },
    }),
    mdx(),
  ],
});
