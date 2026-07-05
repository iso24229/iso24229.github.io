import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { RegisterIndex } from '../../domain/register/RegisterIndex';
import { semanticExporters } from '../../semantic/exporters';

type RawEntry = { id: string; data: unknown };

export const GET: APIRoute = async () => {
  const index = await RegisterIndex.load(async (slug) => {
    const coll = (await getCollection(slug as Parameters<typeof getCollection>[0])) as unknown as RawEntry[];
    return coll.map((c) => ({ id: c.id, data: c.data as Record<string, unknown> }));
  });
  const out = semanticExporters.ttl.exportIndex(index);
  return new Response(out, {
    headers: { 'Content-Type': 'text/turtle; charset=utf-8' },
  });
};
