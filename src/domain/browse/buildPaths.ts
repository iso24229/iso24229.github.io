import { getCollection } from 'astro:content';
import type { GetStaticPaths } from 'astro';

export interface EntryLike { id: string; data: Record<string, unknown>; }
export interface BrowseProps {
  code: string;
  asSource: EntryLike[];
  asTarget: EntryLike[];
}

function refId(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'object') {
    const obj = v as Record<string, unknown>;
    const direct = obj.id ?? obj.uuid ?? obj.$ref ?? obj.slug;
    if (typeof direct === 'string') return direct;
  }
  return null;
}

interface BuildOptions {
  /** Spelling-system field that carries the code we're grouping by (e.g. 'languageCode' for ISO 639). */
  spellingField: string;
  /** Optional direct fields on the system-code entry to fall back to when the spelling-system
   *  lookup doesn't yield a code. Used for ISO 15924 (sourceScriptCode / targetScriptCode). */
  fallbackSourceField?: string;
  fallbackTargetField?: string;
}

export function buildBrowsePaths(opts: BuildOptions): GetStaticPaths {
  return (async () => {
    const all = (await getCollection('system-code')) as unknown as EntryLike[];
    const allSpellings = (await getCollection('spelling-system')) as unknown as EntryLike[];

    const codeOf = new Map<string, string>();
    for (const s of allSpellings) {
      const v = s.data[opts.spellingField];
      if (typeof v === 'string' && v.length > 0) codeOf.set(s.id.toLowerCase(), v);
    }

    function codesFor(entry: EntryLike): { source?: string; target?: string } {
      let source: string | undefined;
      let target: string | undefined;
      const sourceSpellingId = refId(entry.data.sourceSpelling);
      const targetSpellingId = refId(entry.data.targetSpelling);
      if (sourceSpellingId) {
        const key = sourceSpellingId.toLowerCase();
        if (codeOf.has(key)) source = codeOf.get(key);
      }
      if (targetSpellingId) {
        const key = targetSpellingId.toLowerCase();
        if (codeOf.has(key)) target = codeOf.get(key);
      }
      if (!source && opts.fallbackSourceField) {
        const v = entry.data[opts.fallbackSourceField];
        if (typeof v === 'string' && v.length > 0) source = v;
      }
      if (!target && opts.fallbackTargetField) {
        const v = entry.data[opts.fallbackTargetField];
        if (typeof v === 'string' && v.length > 0) target = v;
      }
      return { source, target };
    }

    const byCode = new Map<string, { asSource: EntryLike[]; asTarget: EntryLike[] }>();
    for (const e of all) {
      const { source, target } = codesFor(e);
      if (source) {
        if (!byCode.has(source)) byCode.set(source, { asSource: [], asTarget: [] });
        byCode.get(source)!.asSource.push(e);
      }
      if (target) {
        if (!byCode.has(target)) byCode.set(target, { asSource: [], asTarget: [] });
        byCode.get(target)!.asTarget.push(e);
      }
    }

    return [...byCode.keys()].sort().map((code) => ({
      params: { code },
      props: {
        code,
        asSource: byCode.get(code)!.asSource,
        asTarget: byCode.get(code)!.asTarget,
      },
    }));
  }) satisfies GetStaticPaths;
}
