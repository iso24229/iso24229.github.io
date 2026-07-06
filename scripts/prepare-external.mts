#!/usr/bin/env tsx
/**
 * Prepare external data sources for the build.
 *
 * For each source listed in `external-sources.yaml`:
 *
 * - Local dev: if a sibling clone exists at the configured `localPath`,
 *   symlink it into `.cache/external/<name>/`. Changes in the sibling
 *   repo are picked up on the next page load — no copy step.
 * - CI / fallback: `git clone --depth 1 --branch <ref>` into
 *   `.cache/external/<name>/`. Uses `GITHUB_TOKEN` for private repos.
 *
 * Idempotent: if the cache directory already exists and is a valid git
 * checkout, the source is skipped. If it exists as a stale or partial
 * checkout (e.g. restored from CI cache), it is removed and re-cloned.
 *
 * This script never modifies the source repositories.
 */
import { mkdir, rm, lstat, symlink, access, readlink } from 'node:fs/promises';
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

async function isSymlink(p: string): Promise<boolean> {
  try {
    const stat = await lstat(p);
    return stat.isSymbolicLink();
  } catch {
    return false;
  }
}

async function prepareFromLocal(source: ExternalSource): Promise<boolean> {
  const linkPath = join(CACHE_ROOT, source.name);
  const siblingResolved = resolve(source.localPath);

  if (await isSymlink(linkPath)) {
    const target = await readlink(linkPath);
    if (target === siblingResolved) {
      console.log(`✓ ${source.name} → ${siblingResolved} (symlinked, sibling)`);
      return true;
    }
    // Pointed at the wrong place — remove and re-link.
    await rm(linkPath, { recursive: true, force: true });
  }

  if (!existsSync(siblingResolved)) {
    return false;
  }

  if (await pathExists(linkPath)) {
    // Stale directory from a prior clone — remove before symlinking.
    await rm(linkPath, { recursive: true, force: true });
  }

  await mkdir(CACHE_ROOT, { recursive: true });
  await symlink(siblingResolved, linkPath, 'dir');
  console.log(`✓ ${source.name} → ${siblingResolved} (symlinked, fresh)`);
  return true;
}

/**
 * Returns the access token to use for cloning private sources, if any.
 *
 * Preference order:
 * 1. ISO24229_CI_PAT_TOKEN — PAT scoped to read the iso24229 org's
 *    private repos. Set as a secret in the website repo's CI.
 * 2. GITHUB_TOKEN — fallback for environments where the default
 *    Actions token has cross-repo read access (e.g. via org settings).
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
  await mkdir(CACHE_ROOT, { recursive: true });
  for (const source of externalSources) {
    const linked = await prepareFromLocal(source);
    if (linked) continue;

    const dest = join(CACHE_ROOT, source.name);

    // Always start from a clean directory in CI. The Actions cache may
    // restore a stale checkout from a previous run; rm ensures the new
    // clone succeeds.
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
