import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import partytown from "@astrojs/partytown";
import robotsTxt from "astro-robots-txt";
import mdx from '@astrojs/mdx';
import { siteUrl } from "./src/config";

export default defineConfig({
  prefetch: {
    prefetchAll: true
  },
  integrations: [
    mdx(),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
    robotsTxt({
      sitemap: false,
      policy: [
        {
          userAgent: '*',
          disallow: ['/'],
        }
      ],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  site: siteUrl,
});
