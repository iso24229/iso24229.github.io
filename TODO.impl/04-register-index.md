# 4. Register index (in-memory lookup table)

## Goal

Provide a single `RegisterIndex` that loads every item from every collection at build time and offers O(1) lookups by UUID, by code, and by relation. This is the data-access layer that pages and exporters consume — they never call `getCollection()` directly.

## Architecture

- `RegisterIndex` is a singleton built once per build.
- Internally: `Map<ItemClassSlug, Map<UUID, RegisterItem>>`.
- Lookup methods:
  - `byUuid(itemClass, uuid): RegisterItem | undefined`
  - `byCode(code: string): SystemCode | undefined` (only system-code has a `code`)
  - `relationsOf(systemCode): SystemRelation[]`
  - `authorityOf(systemCode): Authority | undefined`
  - `sourceSpellingOf(systemCode): SpellingSystem | undefined` (or null when bare script)
  - `targetSpellingOf(systemCode): SpellingSystem | undefined`
- Lazy-built and cached on first access; safe to call from any page frontmatter.

## Implementation

1. `src/domain/register/RegisterIndex.ts` — the singleton.
2. `src/domain/register/RegisterIndexBuilder.ts` — builds the index from `getCollection()` calls. This is the **only** place that imports `getCollection`.
3. Specs: feed a fixture set of YAML into the builder, assert lookups.

## Acceptance

- [ ] No page file imports `getCollection` (`grep -lr "getCollection" src/pages | wc -l` == 0)
- [ ] `byUuid`, `byCode`, `relationsOf` all O(1) or O(degree)
- [ ] The lifecycle-graph builder (see [12-lifecycle-graph.md](./12-lifecycle-graph.md)) consumes `RegisterIndex`, not raw data
