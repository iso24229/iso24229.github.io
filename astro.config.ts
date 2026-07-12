import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import partytown from "@astrojs/partytown";
import robotsTxt from "astro-robots-txt";
import mdx from '@astrojs/mdx';
import vue from '@astrojs/vue';
import { siteUrl } from "./src/config";

export default defineConfig({
  prefetch: {
    prefetchAll: true
  },
  integrations: [
    mdx(),
    vue(),
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
    server: {
      watch: {
        // `.cache/external/` is symlinked to sibling git repos in local
        // dev. Without these ignores, Vite's file watcher follows the
        // symlinks and watches every file in those repos (including
        // their .git internals), causing runaway CPU.
        ignored: [
          '**/.cache/**',
          '**/.cache/**/.*',
          '**/node_modules/**',
          '**/.git/**',
          '**/dist/**',
        ],
      },
    },
  },
  site: siteUrl,
});
