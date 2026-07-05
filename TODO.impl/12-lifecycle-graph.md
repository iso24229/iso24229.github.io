# 12. Lifecycle graph visualization

## Goal

Visualize a system-code's relationships (predecessor, successor, alias, macrolanguage) and its position in the source/target spelling network as an interactive graph.

## Architecture

- `LifecycleGraph` (in `src/domain/graph/LifecycleGraph.ts`) consumes a `RegisterItem` and a `RegisterIndex` and produces a serializable graph descriptor: `{ nodes: Node[], edges: Edge[] }`.
- The graph descriptor is rendered client-side by vis-network (small, ~50KB gzipped) inside a `<LifecycleGraph />` Astro component that takes a `center: SystemCode` prop.
- The component is island-rendered (`client:idle`); the graph descriptor is serialized as JSON in the page.

## Implementation

1. `src/domain/graph/LifecycleGraph.ts` — builds the node/edge set by walking `RegisterIndex.relationsOf()` and the source/target spelling systems. Truncates at depth 2 to keep the graph readable.
2. `src/components/LifecycleGraph.astro` — renders a `<div>` target + serialized JSON + a `<script>`定义 that imports vis-network lazily.
3. Embed on every system-code detail page above the metadata table.

## Node design

- Center node (the system itself): large, accent-coloured
- Source/target spelling systems: medium, neutral colour
- Related systems (predecessor/successor/alias): small, edge-coloured by relation type
- Authority node (top-right corner): icon + name

## Acceptance

- [ ] Graph renders on every system-code page that has at least one relation
- [ ] Vis-network is lazy-loaded (initial page weight unchanged)
- [ ] Clicking a node navigates to that entity's page
- [ ] Graph descriptor is also exposed as JSON-LD for crawlers
