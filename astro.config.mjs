import { defineConfig } from 'astro/config';
import partytown from "@astrojs/partytown";
import robotsTxt from "astro-robots-txt";
import prefetch from "@astrojs/prefetch";
import mdx from '@astrojs/mdx';
import serviceWorker from "astrojs-service-worker";

const githubUsername = import.meta.env.GITHUB_REPOSITORY_OWNER || 'INSERT_GITHUB_USERNAME_HERE';


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
  site: `https://${githubUsername}.github.io`
});
