import { defineConfig } from 'astro/config';
import partytown from "@astrojs/partytown";
import robotsTxt from "astro-robots-txt";
import prefetch from "@astrojs/prefetch";
import mdx from '@astrojs/mdx';
import serviceWorker from "astrojs-service-worker";
import { siteUrl } from "./src/config";

// https://astro.build/config
export default defineConfig({
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
    prefetch(),
  ],
  site: siteUrl,
});
