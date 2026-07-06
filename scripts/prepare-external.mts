#!/usr/bin/env tsx
/**
 * Prepare external data sources for the build (CI case only).
 *
 * For each source listed in `external-sources.yaml`:
 *
 * - If a sibling clone exists at the configured `localPath`, do
 *   nothing — `resolveSourcePath()` reads from the sibling directly.
 *   No symlink, no copy. The sibling is the source of truth.
 *
 * - Otherwise (typically CI), `git clone --depth 1 --branch <ref>`
 *   into `.cache/external/<name>/`. Uses ISO24229_CI_PAT_TOKEN (or
 *   fallback GITHUB_TOKEN) for private repos.
 *
 * We deliberately do NOT symlink `.cache/external/<name>` to the
 * sibling. Earlier versions did, and every file-walking tool that
 * followed the symlink (Vite, TypeScript, Astro content collections)
 * ended up watching or type-checking the sibling's `.git` internals,
 * causing CPU spin and build failures. See commit history of
 * astro.config.ts and prepare-external.mts.
 *
 * This script is idempotent: existing valid clones are kept; stale or
 * partial checkouts are removed and re-cloned. It never modifies the
 * source repositories.
 */
import { mkdir, rm, access } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { parse } from 'yaml';

interface ExternalSource {
  readonly name: string;
  readonly repoUrl: string;
  readonly ref: string;
  readonly localPath: string;
  readonly private: boolean;
}

const externalSources: readonly ExternalSource[] = (
  parse(readFileSync('external-sources.yaml', 'utf-8')) as {
    sources: readonly ExternalSource[];
  }
).sources;

const CACHE_ROOT = '.cache/external';

async function pathExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns the access token to use for cloning private sources, if any.
 *
 * Preference order:
 * 1. ISO24229_CI_PAT_TOKEN — PAT scoped to read the iso24229 org's
 *    private repos. Set as a secret in the website repo's CI.
 * 2. GITHUB_TOKEN — fallback for environments where the default
 *    Actions token has cross-repo read access (e.g. via org setting).
 */
function privateSourceToken(): string | undefined {
  return process.env.ISO24229_CI_PAT_TOKEN ?? process.env.GITHUB_TOKEN;
}

function prepareFromClone(source: ExternalSource): void {
  const dest = join(CACHE_ROOT, source.name);
  const token = privateSourceToken();
  const url =
    source.private && token
      ? source.repoUrl.replace('https://', `https://x-access-token:${token}@`)
      : source.repoUrl;

  execFileSync(
    'git',
    ['clone', '--depth', '1', '--branch', source.ref, url, dest],
    { stdio: ['ignore', 'inherit', 'inherit'] },
  );
  console.log(`✓ ${source.name}@${source.ref} (cloned)`);
}

async function main(): Promise<void> {
  for (const source of externalSources) {
    const siblingResolved = resolve(source.localPath);

    // Local dev: sibling clone present — nothing to do. resolveSourcePath
    // reads from it directly.
    if (existsSync(siblingResolved)) {
      console.log(`✓ ${source.name} → ${siblingResolved} (sibling)`);
      continue;
    }

    // CI / fallback: clone into the cache.
    await mkdir(CACHE_ROOT, { recursive: true });
    const dest = join(CACHE_ROOT, source.name);

    if (await pathExists(dest)) {
      console.log(`· ${source.name}: removing stale cache directory`);
      await rm(dest, { recursive: true, force: true });
    }

    try {
      prepareFromClone(source);
    } catch (err) {
      // The register is private and may not have auth in some
      // environments; the site still builds for the reference data.
      if (source.name === 'iso24229-register') {
        console.warn(
          `! ${source.name}: clone failed (${(err as Error).message}). Continuing — register data will be empty.`,
        );
        continue;
      }
      throw err;
    }
  }
}

main().catch((err) => {
  console.error('Prepare failed:', err);
  process.exit(1);
});
