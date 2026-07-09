# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

The official website of the **ISO 24229 Registry** at <https://www.iso24229.org> (see `CNAME`). The registry is the Registration Authority for the ISO 24229 standard, maintained by CalConnect/Ribose on behalf of ISO/TC 46/WG 3.

Static site built with **Astro 7** and TypeScript. No backend — all pages are pre-rendered at build time from YAML/Markdown content collections.

## Common commands

`pnpm` is the package manager. `pnpm-workspace.yaml` holds the pnpm settings (allow-lists, `minimumReleaseAgeExclude` for our own `@iso24229/*` packages).

| Task | Command |
| --- | --- |
| Install deps | `pnpm install` |
| Dev server (port 4321) | `pnpm run dev` |
| Production build → `dist/` | `pnpm run build` |
| Preview built site | `pnpm run preview` |
| Type check | `pnpm run check` (Astro + `@astrojs/check`) |
| Run unit tests | `pnpm test` (vitest) |
| Regenerate `code-names.json` only | `pnpm run prebuild` |

Formatting is **Biome** with `useEditorconfig: true` — `biome.json` defers to `.editorconfig` (2-space indent, LF, UTF-8, trim trailing whitespace, final newline). Format with `npx biome format --write`.

## Where the register data comes from

The site consumes three sibling projects as **npm packages** under the `@iso24229/` scope (declared in `package.json`):

| Package | Contents |
| --- | --- |
| `@iso24229/iso639-data` | ISO 639 parts 1/2/3/5 — ~7 900 languages |
| `@iso24229/iso15924-data` | ISO 15924 — 226 script codes |
| `@iso24229/register` | ISO 24229 register — 7 item classes |

Resolution is centralised in `src/config/external-sources.ts`:

- Reads `external-sources.yaml` (typed metadata: repo URL, ref, npm package name).
- `resolveSourcePath(name)` returns `node_modules/@iso24229/<package>/`, falling back to a sibling checkout at `../<name>` for local dev.
- Astro content collections (`src/content.config.ts`) and `scripts/build-code-names.mts` both call this resolver.

`scripts/build-code-names.mts` runs as `predev`/`prebuild`, walks the installed packages, and emits `src/data/code-names.json` — a flat lookup of language-code → name and script-code → name used by the search index and the combobox widgets on the proposal forms. It **fails loudly** if either source is missing or yields zero entries; this is the guard against silent empty-data deploys.

## Deployment

`main` is the only deployment target. Push to `main` → `.github/workflows/deploy.yml` runs `withastro/action@v6` → GitHub Pages. No staging.

### Auto-redeploy chain (npm packages)

The three `@iso24229/*` packages keep the live site fresh without manual bumps:

1. A package's data merges → its `publish.yml` (register) or `sync.yml` (iso639-data, iso15924-data) bumps patch, tags `vX.Y.Z`, pushes the tag.
2. The tag triggers the package's `release.yml`, which publishes to npm via **trusted publishing (OIDC)** — no `NPM_TOKEN` secret.
3. On publish success, `release.yml` fires `repository_dispatch` (`package-published`) at this repo with payload `{package, version, sha}`.
4. `.github/workflows/bump-deps.yml` handles the dispatch, runs `pnpm update <package>@latest`, commits the lockfile, and pushes.
5. That push triggers `deploy.yml` via the normal `push to main` path.

The first publish of a new package requires the npm-side **trusted publisher** binding to be configured on npmjs.com (repo, workflow filename) — otherwise `npm publish --provenance` returns `E404`.

`robots.txt` is generated at build time by `astro-robots-txt` and **disallows `/`** for all user agents (see `astro.config.ts`). Do not change this without explicit instruction.

## Architecture

### Schema-driven content collections (`src/content.config.ts`)

The whole registry is **schema-driven**. This file is the single source of truth for what an "item class" is and how each entry is shaped. Read it carefully before touching anything related to entries.

- `itemClasses` — the canonical list of the 7 register item classes: `authority`, `code-status`, `spelling-system`, `system-code`, `system-relation`, `system-relation-type`, `system-status`. Adding a new class requires editing this list **and** adding an entry to `versionedSchemaWithRichData.fields` with a `{ title, description?, schema }` shape.
- Each field in a class's `schema` can be:
  - a primitive string like `'string'`, `'number'`, `'date'` (append `?` for optional),
  - a `{ title, description?, type }` object for richer labelling,
  - a `ref('itemClass', optional?)` reference (cross-class link, becomes an Astro `reference()`),
  - an array (e.g. `[ref('system-relation')]`).
- The pipeline compiles these shapes via `transformSchemaToZodSchema` into Zod schemas, which are then wrapped in Astro `defineCollection({ type: 'data' })` calls. `zodCollectionsWithRichData` exposes everything a page needs (collection + display metadata).
- `mapSchema` and `reduceSchema` iterate fields while preserving the declared order — use these instead of `Object.entries` when rendering field tables, so titles/types stay consistent.

The collection loaders use `glob({ base: join(resolveSourcePath('register'), itemClass) })` — they read YAML files directly from the installed `@iso24229/register` package.

### Routing (`src/pages/`)

1. `src/pages/index.astro` — landing page.
2. `src/pages/register/index.astro` — register landing; iterates item classes.
3. `src/pages/register/[itemClass]/{index,p/[page],i/[uuid]}.astro` — list / paginated list / single-entry detail. `getStaticPaths` iterates every item class and pre-renders all pages.
4. `src/pages/register/authority/[uuid].astro` — authority-specific page (different shape from the generic item-class page; shows systems-by-authority).
5. `src/pages/register/iso639/[code].astro` and `iso15924/[code].astro` — browse-by-language and browse-by-script pages; power the proposal-form comboboxes.
6. `src/pages/{learn,about,news,specs}/...` — editorial content.

### Theming

- `src/layouts/Layout.astro` — base HTML shell. Dark mode is **class-based** (`.dark` on `<html>`, toggled client-side by `ThemeControl.astro`).
- Tailwind v4's `dark:` variant uses `prefers-color-scheme` by default and does **not** respond to the `.dark` class. Use explicit `.dark` selectors in `src/styles/global.css` for class-driven theme switching (the footer logos do this; copy that pattern).
- Design tokens live at the top of `src/styles/global.css` (`--color-paper`, `--color-ink`, etc.). Tailwind utilities like `bg-paper`, `text-ink-muted` resolve to these via `@theme`.

### TypeScript / path aliases

Defined in `tsconfig.json`:

- `@/*` → `src/*`
- `@components/*` → `src/components/*`
- `@layouts/*` → `src/layouts/*`

Project uses Astro's `strict` tsconfig with `verbatimModuleSyntax: true` — always use `import type` for type-only imports.

## Conventions specific to this repo

- Use "register data" (not "registry data") when referring to the data in the register — see commit `8774252`.
- `.gitmodules` and `.nojekyll` exist to keep GitHub Pages from running Jekyll — leave them alone.
- The site deploys from `main` with no review-staging step. Per global rules, never commit directly to `main`, never push tags, never push to `main` — open a PR for every change.
