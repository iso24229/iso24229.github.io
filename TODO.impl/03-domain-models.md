# 3. Domain model layer (OOP, MECE, single source of truth)

## Goal

Introduce a proper domain layer under `src/domain/` that is the canonical in-memory representation of the register. All pages and renderers consume these classes — they never read raw YAML or content-collection entries directly.

## Architecture

### Class hierarchy (open/closed)

```
DomainObject (abstract)
  ├── RegisterItem (abstract) — carries uuid, codeStatus, systemStatus, timestamps
  │     ├── Authority
  │     ├── SpellingSystem
  │     ├── SystemCode
  │     ├── SystemRelation
  │     ├── CodeStatus
  │     ├── SystemStatus
  │     └── SystemRelationType
  └── ReferenceDatum (abstract) — for ISO 639 / ISO 15924 reference entries
        ├── LanguageCode (639-{1,2,3,5})
        └── ScriptCode (15924)
```

Adding a new item class = adding a new subclass + an entry in the `ItemClassRegistry`. No edits to existing classes.

### Single source of truth

`src/content.config.ts` already declares the Zod schemas. The domain layer consumes those schemas' parsed outputs and constructs typed class instances. The Zod schemas remain the validation layer; the classes are the consumption layer.

### Encapsulation rules (TypeScript equivalents of the Ruby rules)

- No `any` anywhere. Use proper types.
- No `(obj as any).privateMethod()` to bypass `private`/`protected`.
- No `Object.defineProperty` to inject state.
- No duck typing — use `instanceof` or `is` type guards where the hierarchy doesn't carry the check.
- Constructor is the only way to set state; mutators go through named methods.

### Module loading

- ES modules only. No dynamic `require()`.
- Top-level `import` for everything in `src/`.
- The domain layer is consumed by Astro frontmatter (build-time only), not shipped to the client.

## Implementation

1. Create `src/domain/shared/Identifiable.ts`, `Timestampable.ts`, `Remarkable.ts` — mixin-style bases.
2. Create `src/domain/items/RegisterItem.ts` (abstract base).
3. Create one file per item class under `src/domain/items/` (e.g. `SystemCode.ts`).
4. Create `src/domain/registry/ItemClassRegistry.ts` — a Map keyed by item-class slug; the only place that knows the full set of item classes.
5. Create `src/domain/factories.ts` — pure functions that turn parsed YAML into class instances. Validates via the existing Zod schemas first.
6. Refactor `src/pages/item-classes/[itemClass]/i/[uuid].astro` to consume a `RegisterItem` instead of `entry[k]`.
7. Refactor `src/pages/item-classes/[itemClass]/p/[page].astro` to map a `RegisterItem[]`.

## Acceptance

- [ ] Every page consumes `RegisterItem` instances, never raw YAML/JSON
- [ ] Adding a new item class requires touching only: (a) `content.config.ts` schema, (b) a new subclass file, (c) one line in `ItemClassRegistry`
- [ ] No `any` in the domain layer (`grep -r ": any" src/domain | wc -l` == 0)
- [ ] Specs cover each domain class's construction, validation, and rendering hooks (see [14-test-suite.md](./14-test-suite.md))
