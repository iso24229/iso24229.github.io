import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { itemClassSlugs } from '../../../../domain/registry/ItemClassRegistry';
import { itemFactories } from '../../../../domain/factories';
import { semanticExporters } from '../../../../semantic/exporters';

type RawEntry = { id: string; data: unknown };
interface EntryLike { id: string; data: Record<string, unknown>; }

export const getStaticPaths = (async () => {
  const all = await Promise.all(
    itemClassSlugs.map(async (itemClass) => {
      const coll = (await getCollection(itemClass)) as unknown as RawEntry[];
      return {
        params: { itemClass },
        entries: coll.map((c) => ({ id: c.id, data: c.data as Record<string, unknown> })),
      };
    }),
  );
  return all.flatMap(({ params, entries }) =>
    (entries as EntryLike[]).map((entry) => ({
      params: { ...params, uuid: entry.id },
    })),
  );
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const { itemClass, uuid } = params as { itemClass: string; uuid: string };
  const coll = (await getCollection(itemClass as Parameters<typeof getCollection>[0])) as unknown as RawEntry[];
  const entry = coll.find((e) => e.id === uuid);
  if (!entry) return new Response('Not found', { status: 404 });

  const factory = itemFactories[itemClass as keyof typeof itemFactories];
  const item = factory(entry.data as Record<string, unknown>);
  const out = semanticExporters.rdf.exportItem(item);
  return new Response(out, {
    headers: { 'Content-Type': 'application/rdf+xml; charset=utf-8' },
  });
};
