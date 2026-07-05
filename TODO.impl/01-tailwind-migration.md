# 1. Tailwind v4 migration

## Goal

Replace the hand-written SCSS-in-`<style>` blocks with Tailwind v4. Centralise all design tokens (colour, type, spacing, radius) in a single `tailwind.config.ts` so the rest of the codebase consumes tokens, not raw values.

## Architecture

- Single source of truth for tokens: `src/styles/tokens.css` (CSS custom properties) consumed by `tailwind.config.ts` via `theme()`.
- Tailwind v4 Vite plugin (`@tailwindcss/vite`), no PostCSS config.
- Per-component styles use Tailwind utility classes; complex repeated patterns live in `@layer components` in a single global stylesheet.
- Dark mode: `class` strategy (matching isotc154), toggled via `data-theme` attribute on `<html>`.

## Implementation

1. `pnpm add -D tailwindcss @tailwindcss/vite`
2. Add the Vite plugin in `astro.config.ts`.
3. Create `src/styles/tokens.css` with ISO 154-style palette (primary `#0061ad`, accent red `#e3000f`, neutral grays) + light/dark variants.
4. Create `src/styles/global.css` with `@import "tailwindcss"` and `@theme { ... }` mapping tokens to Tailwind theme keys.
5. Update `Layout.astro` to import `global.css` and remove the inline `<style is:global>` block.
6. Port `Header.astro`, `Footer.astro`, `Card.astro`, `NavBar.astro` to Tailwind classes.
7. Delete per-component `<style lang="scss">` blocks (now redundant).
8. Remove `sass` from `package.json` once nothing uses it.

## Acceptance

- [ ] `pnpm run build` clean with no warnings
- [ ] All existing pages render identically (or better) to the SCSS baseline
- [ ] Dark/light toggle still works
- [ ] No raw hex codes outside `tokens.css` and `tailwind.config.ts`
- [ ] `sass` package removed
