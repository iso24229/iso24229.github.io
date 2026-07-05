# 5. Submodule wiring (iso639-data, iso15924-data, iso24229-register)

## Goal

Pull the three sibling repos into `iso24229.github.io` as git submodules pinned to release tags. Build reads YAML from each via the `iso24229-loader` (the loader hides the path layout from the rest of the codebase).

## Architecture

```
external/
  iso639-data/        submodule, pinned to data-YYYYMMDD tag
  iso15924-data/      submodule, pinned to data-YYYYMMDD tag
  iso24229-register/  submodule, pinned to vN.N.N tag
```

- One loader per source, all implementing the same interface: `load(): AsyncIterable<{ class: ItemClassSlug, entry: RegisterItem }>`.
- The glob-loader pattern in `content.config.ts` is replaced with a custom loader that reads from the submodule paths.
- CI checks out submodules on push (single `with: submodules: recursive`).

## Implementation

1. `git submodule add git@github.com:iso24229/iso639-data.git external/iso639-data`
2. `git submodule add git@github.com:iso24229/iso15924-data.git external/iso15924-data`
3. `git submodule add git@github.com:iso24229/iso24229-register.git external/iso24229-register`
4. Pin each to its latest tag.
5. Create `src/loaders/RegisterLoader.ts` — a Content Layer loader that globs `external/iso24229-register/**/*.yaml`.
6. Create `src/loaders/ReferenceLoader.ts` — loads ISO 639 / 15924 entries as in-memory `ReferenceDatum` instances (not Astro content collections — these are reference data, not register items).
7. Replace the existing `glob()` loader calls in `content.config.ts` with `RegisterLoader`.
8. Update `.github/workflows/deploy.yml` to use `submodules: recursive`.

## Acceptance

- [ ] `git submodule status` shows all three pinned to tags
- [ ] Local build with submodules checked out succeeds
- [ ] CI build succeeds with `submodules: recursive`
- [ ] Removing/renaming a YAML file in `iso24229-register` and bumping the submodule pointer is the only change needed for the site to reflect the new data
