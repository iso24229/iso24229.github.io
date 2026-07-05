# 6. IA redesign

## Goal

Restructure the site around the audience needs called out in the brief:

| Audience | Section |
| --- | --- |
| Newcomers learning what ISO 24229 is | `/learn/` |
| Users looking up a transliteration system | `/register/` |
| Existing authority submitting a new system | `/apply/existing-authority/` |
| New authority applying to register | `/apply/new-authority/` |
| ISO/TC 46/AG managers | `/managers/` |
| Anyone wanting the formal RA spec | `/specification/` |
| Anyone with questions | `/faq/` |

## Architecture

- Top-nav is data-driven from `src/config/navigation.ts`. Adding a section = adding one entry.
- Each section is a directory under `src/pages/` with its own `index.astro` landing page.
- Breadcrumbs come from a `<Breadcrumbs />` component that walks the URL path.

## Implementation

1. Write `src/config/navigation.ts` with the seven top-level sections.
2. Refactor `NavBar.astro` to render from `navigation.ts`.
3. Create stub `index.astro` files under each section directory with a one-paragraph summary and a card grid of children (children populated in their own TODOs).
4. Update `src/pages/index.astro` to be a true landing page: hero, three-column "audience picker" (I'm a user / I'm an authority / I'm a manager), and recent-activity feed.
5. Add `<Breadcrumbs />` component.
6. Add 404 page that mirrors the new IA.

## Sections

```
src/pages/
├── index.astro                       # hero + audience picker
├── learn/
│   ├── index.astro                   # learn landing
│   ├── what-is-iso-24229.astro       # 639→15924→24229 trio explainer
│   ├── code-structure.astro          # 4-segment colon-form
│   ├── examples.astro                # worked examples
│   └── use-cases.astro
├── register/
│   ├── index.astro                   # was /item-classes
│   ├── [itemClass]/
│   │     ├── index.astro             # redirect to /p/1
│   │     ├── p/[page].astro          # paginated list
│   │     └── i/[uuid].astro          # detail
│   └── authority/
│         └── [uuid].astro            # authority directory entry
├── apply/
│   ├── index.astro
│   ├── existing-authority.astro      # GitHub issue template link
│   └── new-authority.astro
├── managers/
│   ├── index.astro                   # AG composition + ToR
│   ├── meetings.astro                # bimonthly meeting cadence
│   └── members.astro
├── specification/
│   ├── index.astro                   # ISO 19135 compliance + Annex A ToR
│   ├── annex-a.astro                 # Annex A in our own words
│   └── iso-19135.astro               # register operations
└── faq.astro
```

## Acceptance

- [ ] Top-nav reflects the seven sections
- [ ] Every section has at least a landing page
- [ ] `/item-classes/*` URLs redirect to `/register/*` equivalents (preserve external links)
- [ ] Audience picker on home page routes to the right section
- [ ] Breadcrumbs appear on every nested page
