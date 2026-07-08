/**
 * Typed view over `external-sources.yaml`.
 *
 * Sources are consumed as npm packages (@iso24229/<name>); the YAML
 * retains repo/ref metadata for traceability. The website's build
 * pipeline reads files directly from the installed package(s).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';

export interface ExternalSource {
  readonly name: string;
  readonly repoUrl: string;
  readonly ref: string;
  readonly npmPackage: string;
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
 * Reads from `node_modules/<npmPackage>/`. If the package isn't
 * installed (e.g. running before `pnpm install`), falls back to a
 * sibling checkout at `../<name>` for local development convenience.
 */
export function resolveSourcePath(name: ExternalSourceName): string {
  const src = sourceByName(name);
  const pkgPath = resolve('node_modules', src.npmPackage);
  if (fileExists(pkgPath)) return pkgPath;
  const sibling = resolve('..', src.name);
  if (fileExists(sibling)) return sibling;
  return pkgPath;
}

function fileExists(p: string): boolean {
  try {
    readFileSync(p + '/package.json', 'utf-8');
    return true;
  } catch {
    return false;
  }
}
