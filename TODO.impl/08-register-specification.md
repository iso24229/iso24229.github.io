# 8. Register specification page (`/specification/`)

## Goal

Publish the formal Terms of Reference for the ISO 24229 Registration Authority, rewritten in our own words but tracking Annex A of ISO 24229 clause-by-clause. State ISO 19135 compliance. Link to FERIN as a sibling register reference.

## Architecture

- Three MDX pages: index (overview + ISO 19135 statement), `annex-a` (the ToR), `iso-19135` (how we apply the register standard).
- The Annex A page has one `<section>` per clause of the source annex, with a clause-id anchor.
- Clause text is rewritten, not copied. Anything that is verbatim must be in a `<blockquote>` with citation.

## Implementation

1. Read Annex A from `cc-transcription-systems/sources/sections/a1-maintenance.adoc`.
2. Write `src/pages/specification/annex-a.mdx` with one rewritten section per source clause.
3. Write `src/pages/specification/index.mdx` with the ISO 19135 compliance statement, RA identification, and links to Annex A and FERIN.
4. Write `src/pages/specification/iso-19135.mdx` explaining how the ISO 19135 register lifecycle maps to our item classes (proposed/accepted/withdrawn).

## Acceptance

- [ ] Every clause of Annex A has a corresponding rewritten section
- [ ] No verbatim copy of the standard's text outside attributed quotes
- [ ] Page links to https://www.iso.org/standard/78143.html (the standard) and https://ferin.org (sibling register)
- [ ] Clause anchors work for deep-linking
