#!/usr/bin/env node
/**
 * Clear stale build / dev caches.
 *
 * Use this whenever Astro or Vite emits a confusing error referencing
 * a file that doesn't exist (typically after an abrupt dev-server
 * kill, a rename while dev was running, or a branch switch). The
 * usual symptom is:
 *
 *   "No cached compile metadata found for ... The main Astro module
 *    ... should have compiled and filled the metadata first"
 *
 * Safe to run any time. Only removes regenerable caches — never
 * source files, never node_modules proper.
 */
import { rmSync } from 'node:fs';

const targets = [
  ['.astro/ (Astro compile cache + content collections)', '.astro'],
  ['node_modules/.vite/ (Vite deps optimizer cache)', 'node_modules/.vite'],
  ['node_modules/.astro/ (Astro barrel cache)', 'node_modules/.astro'],
  ['dist/ (build output)', 'dist'],
  ['.cache/ (external-data cache from CI clones)', '.cache'],
];

let cleared = 0;
for (const [label, path] of targets) {
  try {
    rmSync(path, { recursive: true, force: true });
    cleared++;
    console.log(`✓ cleared ${label}`);
  } catch (err) {
    console.warn(`! could not clear ${label}: ${err.message}`);
  }
}
console.log(`\nDone. ${cleared}/${targets.length} caches cleared.`);
console.log('Run `pnpm dev` (or `pnpm build`) to regenerate.');
