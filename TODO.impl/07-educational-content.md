# 7. Educational content (`/learn/`)

## Goal

Make ISO 24229 legible to someone who has never encountered a written-language conversion standard before. Cover the trio (ISO 639 language → ISO 15924 script → ISO 24229 conversion system), the structure of a code, and real-world use cases — without copy-pasting the standard.

## Architecture

- One `.mdx` page per concept under `src/pages/learn/`.
- Content lives in MDX so we can embed interactive components (e.g. `<CodeBreakdown code="UN:ara-Arab:Latn:2017" />` that visually decomposes the four segments).
- All factual claims that aren't common knowledge link back to the source standard's clause via footnote.

## Pages

### `/learn/what-is-iso-24229`
- What problem does written-language conversion solve
- The trio: ISO 639 (language) + ISO 15924 (script) + ISO 24229 (conversion)
- Where ISO 24229 sits in the language-technology stack
- 5-minute read

### `/learn/code-structure`
- Anatomy of a code: titular · source spelling · target spelling · identifying
- Permitted characters (digits, A–Z, a–z)
- Segment separators (`:`) vs. element separators (`-`)
- Worked example: `BGN-PCGN:chn-Hans:Latn:1979`
- `<CodeBreakdown />` interactive component

### `/learn/examples`
- ~10 worked examples spanning romanisation, transliteration, etc.
- Each example shows: source text, target text, code, authority, brief explanation

### `/learn/use-cases`
- Library systems (MARC records)
- Geographical names (gazetteers)
- Linguistic research
- Internationalisation pipelines
- Government / diplomatic correspondence

## Acceptance

- [ ] All four pages written, each 500–1500 words
- [ ] `<CodeBreakdown />` component spec'd and reusable
- [ ] Each page reviewed for accuracy against the spec
- [ ] Internal links between pages form a sensible reading order
