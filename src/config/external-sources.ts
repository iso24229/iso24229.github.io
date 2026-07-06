/**
 * Typed view over `external-sources.yaml`.
 *
 * The configuration is data (YAML), not code. This module loads it via
 * the `yaml` package and exposes typed accessors for the rest of the
 * codebase.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';

export interface ExternalSource {
  readonly name: string;
  readonly repoUrl: string;
  readonly ref: string;
  readonly localPath: string;
  readonly private: boolean;
}

interface RawConfig {
  readonly sources: readonly ExternalSource[];
}

const config = parse(readFileSync('external-sources.yaml', 'utf-8')) as RawConfig;

export const externalSources: readonly ExternalSource[] = config.sources;

export type ExternalSourceName = ExternalSource['name'];

export function sourceByName(name: string): ExternalSource {
  const src = externalSources.find((s) => s.name === name);
  if (!src) throw new Error(`Unknown external source: ${name}`);
  return src;
}

/**
 * Resolve the active path for a source.
 *
 * Priority:
 *   1. If a sibling clone exists at `localPath` (developer's machine),
 *      use it directly. No symlink, no copy — tools read from the
 *      sibling repo.
 *   2. Otherwise use `.cache/external/<name>/` — populated by
 *      `scripts/prepare-external.mts` via `git clone` (CI case).
 *
 * We deliberately do NOT create symlinks into `.cache/`. Earlier the
 * cache directory was a symlink to the sibling repo, and Vite / TS /
 * Astro file watchers followed the symlink into the sibling's `.git`,
 * causing runaway CPU. Returning the sibling path directly avoids the
 * entire class of "tool follows symlink somewhere unexpected" bugs.
 */
export function resolveSourcePath(name: ExternalSourceName): string {
  const src = sourceByName(name);
  const sibling = resolve(src.localPath);
  if (existsSync(sibling)) {
    return sibling;
  }
  return `.cache/external/${name}`;
}
