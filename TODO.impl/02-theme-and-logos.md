# 2. Theme and logos

## Goal

Adopt the isotc154 visual language: red ISO logo, ISO/TC 154-style palette, Inter (sans) and JetBrains Mono (mono). Add CalConnect + Ribose logos to the footer, side-by-side, as the operating authorities.

## Architecture

- All logos live in `public/assets/logos/`. They are static assets — no component owns them.
- A single `Footer.astro` renders the operating-authority row from a config list (`src/config/operating-authorities.ts`), so adding/removing an authority = editing one array entry, never touching JSX.
- The Header logo is a single component that takes a `variant: "red" | "blue"` prop (default `red`); the variant just swaps the SVG path.

## Implementation

1. Copy from sibling repos:
   - `isotc154/www.isotc154.org/public/assets/iso-red.svg` → `public/assets/logos/iso-red.svg`
   - `isotc154/www.isotc154.org/public/assets/iso-blue.svg` → `public/assets/logos/iso-blue.svg` (kept as fallback)
   - `isotc154/www.isotc154.org/public/assets/images/liaisons/logo-calconnect-{light,dark}.svg` → `public/assets/logos/calconnect-{light,dark}.svg`
   - `calconnect/calconnect.org/assets/images/external-logos/logo_ribose.svg` → `public/assets/logos/ribose.svg`
2. Create `src/config/operating-authorities.ts` exporting a typed list of `{ name, role, href, logo: { light, dark } }`.
3. `Header.astro`: swap logo src to `iso-red.svg`.
4. `Footer.astro`: render the operating authorities from the config list with side-by-side logos; each is a link.
5. Add dark-mode variants for CalConnect (the `-light` / `-dark` SVGs).

## Acceptance

- [ ] Header shows the red ISO logo
- [ ] Footer shows CalConnect + Ribose logos side-by-side with role labels (e.g. "Operated by CalConnect as Registration Authority", "Built by Ribose")
- [ ] Logos swap correctly in dark mode
- [ ] No logo path hardcoded in component files outside `operating-authorities.ts`
