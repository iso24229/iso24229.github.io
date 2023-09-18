import { defineConfig } from 'astro/config';

import partytown from "@astrojs/partytown";

const githubUsername = 'INSERT_GITHUB_USERNAME_HERE';

// https://astro.build/config
export default defineConfig({
  integrations: [partytown()],
  site: `https://${githubUsername}.github.io`,
});
