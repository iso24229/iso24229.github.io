import { defineConfig } from 'astro/config';
import partytown from "@astrojs/partytown";
import robotsTxt from "astro-robots-txt";
import mdx from '@astrojs/mdx';
import serviceWorker from "astrojs-service-worker";
import { siteUrl } from "./src/config";

// https://astro.build/config
export default defineConfig({
  prefetch: {
    prefetchAll: true
  },
  integrations: [
    serviceWorker(),
    mdx(),
    partytown(),
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
  site: siteUrl,
});
