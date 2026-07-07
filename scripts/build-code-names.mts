// Generates src/data/code-names.json from the iso639-data and iso15924-data
// sibling repos. Run as a prebuild step so the website has fast lookups for
// "what is the human-readable name of code X" without re-reading ~8000 YAML
// files on every page render.
//
// Output shape:
//   {
//     "scripts": { "Hani": { "name": "Han (Hanzi, Kanji, Hanja)", "url": "https://www.unicode.org/iso15924/" }, ... },
//     "languages": { "zho": { "name": "Chinese", "part": "639-3", "url": "https://iso639-3.sil.org/..." }, ... }
//   }
//
// All language codes (639-1 alpha-2, 639-2 alpha-3 bibliographic+terminological,
// 639-3, 639-5) are normalised into the same flat lookup, with the canonical
// ISO 639-3 identifier used as the URL slug where possible.

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

interface ScriptEntry {
  name: string;
  url: string;
}

interface LanguageEntry {
  name: string;
  part: string;
  url: string;
}

const ISO15924_URL = 'https://www.unicode.org/iso15924/';
const ISO639_URLS: Record<string, (code: string) => string> = {
  '639-1': (c) => `https://www.loc.gov/standards/iso639-2/php/langcodes_name.php?lang_id=${c}`,
  '639-2': (c) => `https://www.loc.gov/standards/iso639-2/php/langcodes_name.php?lang_id=${c}`,
  '639-3': (c) => `https://iso639-3.sil.org/code/${c}`,
  '639-5': (c) => `https://id.loc.gov/vocabulary/iso639-5/${c}`,
};

async function loadYaml(path: string): Promise<any> {
  if (!existsSync(path)) return null;
  const text = await readFile(path, 'utf-8');
  return parse(text);
}

async function loadDir(path: string): Promise<string[]> {
  if (!existsSync(path)) return [];
  return (await readdir(path)).filter((f) => f.endsWith('.yaml'));
}

async function buildScripts(): Promise<Record<string, ScriptEntry>> {
  const root = resolveSibling('iso15924-data');
  const dir = join(root, 'codes');
  const out: Record<string, ScriptEntry> = {};
  for (const f of await loadDir(dir)) {
    const doc = await loadYaml(join(dir, f));
    if (!doc || !doc.code) continue;
    const name = doc.name?.en ?? doc.pva ?? doc.code;
    out[String(doc.code)] = { name, url: ISO15924_URL };
  }
  return out;
}

async function buildLanguages(): Promise<Record<string, LanguageEntry>> {
  const root = resolveSibling('iso639-data');
  const out: Record<string, LanguageEntry> = {};

  // 639-3 is the most complete (7929 codes). Load it first.
  // Each entry has: code, part2b (bibliographic), part2t (terminological),
  // part1 (alpha-2), name.en, scope, type.
  const files3 = await loadDir(join(root, '639-3'));
  for (const f of files3) {
    const doc = await loadYaml(join(root, '639-3', f));
    if (!doc || !doc.code) continue;
    const name = doc.name?.en ?? doc.code;
    const entry: LanguageEntry = {
      name,
      part: '639-3',
      url: ISO639_URLS['639-3'](doc.code),
    };
    out[String(doc.code)] = entry;
    // Map alpha-2 and bibliographic/terminological variants to the same entry
    if (doc.part1) out[String(doc.part1)] = { ...entry, part: '639-1', url: ISO639_URLS['639-1'](doc.part1) };
    if (doc.part2b && doc.part2b !== doc.code) {
      out[String(doc.part2b)] = { ...entry, part: '639-2', url: ISO639_URLS['639-2'](doc.part2b) };
    }
    if (doc.part2t && doc.part2t !== doc.code) {
      out[String(doc.part2t)] = { ...entry, part: '639-2', url: ISO639_URLS['639-2'](doc.part2t) };
    }
  }

  // 639-5 family codes (26 entries) — overlay on top
  const files5 = await loadDir(join(root, '639-5'));
  for (const f of files5) {
    const doc = await loadYaml(join(root, '639-5', f));
    if (!doc || !doc.code) continue;
    const name = doc.name?.en ?? doc.code;
    out[String(doc.code)] = {
      name,
      part: '639-5',
      url: ISO639_URLS['639-5'](doc.code),
    };
  }

  return out;
}

function resolveSibling(name: string): string {
  // Mirror of src/config/external-sources.ts resolveSourcePath logic — but
  // we can't import it here because the script runs in node, not Astro.
  // Sibling path: same parent dir as this repo.
  const here = process.cwd();
  const sibling = join(here, '..', name);
  if (existsSync(sibling)) return sibling;
  // CI fallback: .cache/external/<name>
  const cached = join(here, '.cache', 'external', name);
  return cached;
}

const [scripts, languages] = await Promise.all([buildScripts(), buildLanguages()]);
const out = { scripts, languages, _meta: { generatedAt: new Date().toISOString() } };
await writeFile('src/data/code-names.json', JSON.stringify(out, null, 2));
console.log(`Generated src/data/code-names.json: ${Object.keys(scripts).length} scripts, ${Object.keys(languages).length} languages`);
