# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

The official website of the **ISO 24229 Registry** at <https://www.iso24229.org> (see `CNAME`). The registry is the Registration Authority for the ISO 24229 standard, maintained by CalConnect/Ribose on behalf of ISO/TC 46/WG 3.

It is a static site built with **Astro 5** and TypeScript. There is no backend — all pages are pre-rendered at build time from JSON/Markdown content collections under `src/content/`.

## Common commands

`pnpm` is the package manager (security overrides are pinned in `package.json#pnpm.overrides`). A `Makefile` wraps the common pnpm scripts, and a Nix flake (+ `direnv` via `.envrc`) provides `biome` and the same scripts as shell commands.

| Task | Command |
| --- | --- |
| Install deps | `pnpm install` |
| Dev server (port 4321) | `pnpm run dev` (or `make dev` / `make serve`) |
| Production build → `dist/` | `pnpm run build` (or `make build`) |
| Preview built site | `pnpm run preview` (or `make preview`) |
| Type check | `pnpm run check` (Astro + `@astrojs/check`) |
| Update Nix flakes | `make update-flakes` |

Formatting is **Biome** with `useEditorconfig: true` — `biome.json` defers to `.editorconfig` (2-space indent, LF, UTF-8, trim trailing whitespace, final newline). Format with `npx biome format --write`.

## Deployment

Push to `main` → `.github/workflows/deploy.yml` runs `withastro/action@v2` and deploys to GitHub Pages. **There is no staging environment wired up** (the README documents one but it is commented out). Production is the only deployment target — treat `main` accordingly.

`robots.txt` is generated at build time by `astro-robots-txt` and **disallows `/`** for all user agents (see `astro.config.ts`). Do not change this without explicit instruction.

## Architecture

### Schema-driven content collections (`src/content/config.ts`)

The whole registry is **schema-driven**. This file is the single source of truth for what an "item class" is and how each entry is shaped. Read it carefully before touching anything related to entries.

- `itemClasses` — the canonical list of the 7 register item classes: `authority`, `code-status`, `spelling-system`, `system-code`, `system-relation`, `system-relation-type`, `system-status`. Adding a new class requires editing this list **and** adding an entry to `versionedSchemaWithRichData.fields` with a `{ title, description?, schema }` shape.
- Each field in a class's `schema` can be:
  - a primitive string like `'string'`, `'number'`, `'date'` (append `?` for optional),
  - a `{ title, description?, type }` object for richer labelling,
  - a `ref('itemClass', optional?)` reference (cross-class link, becomes an Astro `reference()`),
  - an array (e.g. `[ref('system-relation')]`).
- The pipeline compiles these shapes via `transformSchemaToZodSchema` into Zod schemas, which are then wrapped in Astro `defineCollection({ type: 'data' })` calls. `zodCollectionsWithRichData` exposes everything a page needs (collection + display metadata).
- `mapSchema` and `reduceSchema` iterate fields while preserving the declared order — use these instead of `Object.entries` when rendering field tables, so titles/types stay consistent.
- `versionedSchemaWithRichData` carries a top-level `version` string. There is a `TODO` to source this from an external file/URL instead of inlining it — keep that in mind before assuming the schema is hard-coded forever.

When adding an item class, also create an empty directory `src/content/<new-class>/_keep` so Astro picks up the collection.

### Routing (`src/pages/`)

Three nested layers drive the registry UI:

1. `src/pages/index.astro` — landing page, links to the register.
2. `src/pages/item-classes.astro` — register landing; iterates `zodCollectionsWithRichData` and renders one `Card` per item class.
3. `src/pages/item-classes/[itemClass].astro` — thin redirect to `/item-classes/<itemClass>/p/1`.
4. `src/pages/item-classes/[itemClass]/p/[page].astro` — **paginated list** of entries for a class. Uses Astro's `paginate()` with `pageSize: 10`. `getStaticPaths` iterates every item class and pre-renders all pages.
5. `src/pages/item-classes/[itemClass]/i/[uuid].astro` — **single-entry detail page**. Renders every field in the schema via `mapSchema`, with the field's `titleOf` label and `primitiveTypeOf` type. New fields added to a class's schema automatically show up here.

### Layouts and theming

- `src/layouts/Layout.astro` — base HTML shell. Defines CSS custom properties for the **dark-default theme** (`--text-color`, `--background-color`, `--accent`, etc.) and switches via `data-theme` on `<html>` (`"default" | "light" | "dark"`). `ThemeControl.astro` toggles the attribute client-side. CSS lives in a single `<style is:global>` block — most styling changes happen here, not in component files.
- `src/layouts/ItemClass.astro` — thin wrapper around `Layout` used by the registry pages.
- `src/components/Header.astro`, `Footer.astro`, `NavBar.astro`, `Card.astro`, `ThemeControl.astro`, `GoogleAnalytics.astro` are the shared UI components.

### Analytics and performance integrations (`astro.config.ts`)

- `@astrojs/partytown` runs Google Tag Manager scripts in a web worker (configured to forward `dataLayer.push`). `GoogleAnalytics.astro` injects the gtag snippet with `type="text/partytown"`.
- `astrojs-service-worker` registers a service worker for offline support.
- `@astrojs/prefetch` with `prefetchAll: true` — every internal link is prefetched.
- `@astrojs/mdx` — Markdown content (e.g. `src/pages/about.mdx`, `src/pages/404.md`).

### TypeScript / path aliases

Defined in `tsconfig.json`:

- `@/*` → `src/*`
- `@components/*` → `src/components/*`
- `@layouts/*` → `src/layouts/*`

Project uses Astro's `strict` tsconfig with `verbatimModuleSyntax: true` — always use `import type` for type-only imports.

## Conventions specific to this repo

- Use "register data" (not "registry data") when referring to the data in the register — see commit `8774252`.
- `_keep` files inside `src/content/<class>/` exist so git/Astro don't drop empty collection directories. Don't delete them.
- `.gitmodules` and `.nojekyll` exist to keep GitHub Pages from running Jekyll — leave them alone.
- The site deploys from `main` with no review-staging step. Per global rules, never commit directly to `main`, never push tags, never push to `main` — open a PR for every change.
