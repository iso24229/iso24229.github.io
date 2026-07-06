/**
 * Typed view over `external-sources.yaml`.
 *
 * The configuration is data (YAML), not code. This module loads it via
 * the `yaml` package and exposes typed accessors for the rest of the
 * codebase.
 */
import { readFileSync } from 'node:fs';
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
 * Resolve the active cache path for a source. Always returns the cache
 * path — `scripts/prepare-external.mts` is responsible for ensuring
 * the cache path contains the right thing (symlink to sibling, or git
 * clone).
 */
export function resolveSourcePath(name: ExternalSourceName): string {
  sourceByName(name); // throws on unknown
  return `.cache/external/${name}`;
}
