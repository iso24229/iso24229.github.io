import type { APIRoute } from 'astro';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ReferenceDataIndex } from '../../domain/reference/ReferenceDataIndex';
import { resolveSourcePath } from '../../config/external-sources';

export const GET: APIRoute = async () => {
  const idx = ReferenceDataIndex.load();
  let scriptCodes: string[] = [];
  try {
    const root = join(resolveSourcePath('iso15924-data'), 'codes');
    scriptCodes = readdirSync(root)
      .filter((f: string) => f.endsWith('.yaml'))
      .map((f: string) => f.replace(/\.yaml$/, ''));
  } catch {
    // reference data not prepared — return empty
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
