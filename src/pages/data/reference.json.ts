import type { APIRoute } from 'astro';
import { readdirSync } from 'node:fs';
import { ReferenceDataIndex } from '../../domain/reference/ReferenceDataIndex';

export const GET: APIRoute = async () => {
  const idx = ReferenceDataIndex.load();
  let scriptCodes: string[] = [];
  try {
    scriptCodes = readdirSync('external/iso15924-data/codes')
      .filter((f: string) => f.endsWith('.yaml'))
      .map((f: string) => f.replace(/\.yaml$/, ''));
  } catch {
    // submodules not checked out — return empty
  }

  const body = {
    scriptCount: idx.iso15924Count,
    iso639Count: idx.iso639Count,
    scripts: scriptCodes,
  };
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
