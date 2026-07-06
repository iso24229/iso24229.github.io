# 5. Decoupled external sources (was: Submodule wiring)

## Goal

The website must read three external repositories at build time:

- `iso24229/iso639-data` — ISO 639 reference codes
- `iso24229/iso15924-data` — ISO 15924 reference codes
- `iso24229/iso24229-register` — the register itself

It must **not** bind to them via git submodules. The website is a
deployment of register data, not a fork of it.

## Architecture

- **Configuration is data, not code.** `external-sources.yaml` at the
  repo root lists each source's `repoUrl`, `ref`, `localPath`, and
  `private` flag.
- **A single npm script prepares the cache.** `scripts/prepare-external.mts`
  reads the YAML config and for each source:
  - **Local dev:** if a sibling clone exists at `localPath`, symlinks it
    into `.cache/external/<name>/`. Edits in the sibling are picked up
    on the next page load.
  - **CI / fallback:** `git clone --depth 1 --branch <ref>` into
    `.cache/external/<name>/`. Uses `GITHUB_TOKEN` for private repos.
- **Loaders never hardcode paths.** They call `resolveSourcePath(name)`
  from `src/config/external-sources.ts`, which returns the cache path.
- **No git operations on the website repo** when changing which
  register to point at. Edit the YAML, re-run the build.

## Implementation

- ✅ `external-sources.yaml` (config)
- ✅ `src/config/external-sources.ts` (typed view)
- ✅ `scripts/prepare-external.mts` (prepare step)
- ✅ `prebuild` / `predev` npm scripts auto-run prepare
- ✅ Deploy workflow passes `GITHUB_TOKEN` for private register clone
- ✅ `.gitignore` excludes `.cache/`

## Acceptance

- [x] A fresh checkout (no `.cache/`) builds successfully via `pnpm run build`
- [x] Local dev with sibling clones uses symlinks (no network)
- [x] CI clone uses `GITHUB_TOKEN` (default Actions token may need org-level
      read permission; alternative: deploy key or PAT)
- [x] Editing `external-sources.yaml` `ref` for the register causes the
      next build to use the new register version
