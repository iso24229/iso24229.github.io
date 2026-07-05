/**
 * Loads ISO 639 and ISO 15924 reference data from the pinned submodules
 * under `external/`. Builds in-memory maps for O(1) code lookups.
 *
 * Adding a new reference dataset = adding a new loader method here.
 * Callers (the validator page, schema validators, the rendering layer)
 * never read submodule files directly.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const ISO639_PATH = 'external/iso639-data';
const ISO15924_PATH = 'external/iso15924-data/codes';

export interface Iso639Entry {
  readonly part: '639-1' | '639-2' | '639-3' | '639-5';
  readonly code: string;
  readonly name: string;
  readonly rawData: Record<string, unknown>;
}

export interface Iso15924Entry {
  readonly code: string;
  readonly number: number;
  readonly name: string;
  readonly rawData: Record<string, unknown>;
}

interface Raw639Entry {
  readonly code?: string;
  readonly name?: { readonly en?: string } | string;
  readonly [k: string]: unknown;
}

interface Raw15924Entry {
  readonly code?: string;
  readonly number?: number;
  readonly name?: { readonly en?: string } | string;
  readonly [k: string]: unknown;
}

function readYaml<T>(path: string): T {
  return parse(readFileSync(path, 'utf-8')) as T;
}

function extractName(name: Raw639Entry['name']): string {
  if (typeof name === 'string') return name;
  return name?.en ?? '';
}

export class ReferenceDataIndex {
  private readonly _iso639: Map<string, Iso639Entry> = new Map();
  private readonly _iso15924: Map<string, Iso15924Entry> = new Map();

  private constructor() {}

  static load(): ReferenceDataIndex {
    const idx = new ReferenceDataIndex();
    idx.loadIso639();
    idx.loadIso15924();
    return idx;
  }

  private loadIso639(): void {
    const parts = ['639-1', '639-2', '639-3', '639-5'] as const;
    for (const part of parts) {
      const dir = join(ISO639_PATH, part);
      let files: string[];
      try {
        files = readdirSync(dir);
      } catch {
        continue;
      }
      for (const file of files) {
        if (!file.endsWith('.yaml')) continue;
        const raw = readYaml<Raw639Entry>(join(dir, file));
        const code = raw.code ?? file.replace(/\.yaml$/, '');
        this._iso639.set(`${part}:${code}`, {
          part,
          code,
          name: extractName(raw.name),
          rawData: raw as Record<string, unknown>,
        });
      }
    }
  }

  private loadIso15924(): void {
    let files: string[];
    try {
      files = readdirSync(ISO15924_PATH);
    } catch {
      return;
    }
    for (const file of files) {
      if (!file.endsWith('.yaml')) continue;
      const raw = readYaml<Raw15924Entry>(join(ISO15924_PATH, file));
      const code = raw.code ?? file.replace(/\.yaml$/, '');
      const rawName = raw.name;
      const name = typeof rawName === 'string' ? rawName : rawName?.en ?? '';
      this._iso15924.set(code, {
        code,
        number: raw.number ?? 0,
        name,
        rawData: raw as Record<string, unknown>,
      });
    }
  }

  /** Look up an ISO 639 code in any part. Returns the first match. */
  iso639(code: string, part?: Iso639Entry['part']): Iso639Entry | undefined {
    if (part) return this._iso639.get(`${part}:${code}`);
    for (const p of ['639-1', '639-2', '639-3', '639-5'] as const) {
      const hit = this._iso639.get(`${p}:${code}`);
      if (hit) return hit;
    }
    return undefined;
  }

  iso15924(code: string): Iso15924Entry | undefined {
    return this._iso15924.get(code);
  }

  get iso639Count(): number {
    return this._iso639.size;
  }

  get iso15924Count(): number {
    return this._iso15924.size;
  }
}
