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
 * Idempotent. Delete `.cache/external/<name>/` to force a re-clone.
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

async function prepareFromLocal(source: ExternalSource): Promise<boolean> {
  const linkPath = join(CACHE_ROOT, source.name);
  const siblingResolved = resolve(source.localPath);

  if (await pathExists(linkPath)) {
    const stat = await lstat(linkPath);
    if (stat.isSymbolicLink()) {
      const target = await readlink(linkPath);
      if (target === siblingResolved) {
        console.log(`✓ ${source.name} → ${siblingResolved} (symlinked, sibling)`);
        return true;
      }
    }
    return false;
  }

  if (!existsSync(siblingResolved)) {
    return false;
  }

  await mkdir(CACHE_ROOT, { recursive: true });
  await symlink(siblingResolved, linkPath, 'dir');
  console.log(`✓ ${source.name} → ${siblingResolved} (symlinked, fresh)`);
  return true;
}

function prepareFromClone(source: ExternalSource): void {
  const dest = join(CACHE_ROOT, source.name);
  const url =
    source.private && process.env.GITHUB_TOKEN
      ? source.repoUrl.replace(
          'https://',
          `https://x-access-token:${process.env.GITHUB_TOKEN}@`,
        )
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
    if (await pathExists(dest)) {
      console.log(`✓ ${source.name} (already prepared)`);
      continue;
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
