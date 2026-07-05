# 13. FAQ page

## Goal

Cover the questions a newcomer or potential submitter is most likely to have. Grouped by audience (general / users / authorities / managers). Searchable.

## Implementation

- One MDX file at `src/pages/faq.mdx` with structured `<details>` elements.
- Each question is also a row in a JSON-LD `FAQPage` schema in the page head.
- Search box filters client-side by question text (no backend).

## Question list (initial)

### General
- Why does ISO 24229 exist?
- Who maintains the register?
- Is use of the register free?
- How is this different from ISO 639 or ISO 15924?
- Where can I read the standard itself?

### For users
- How do I find a transliteration system?
- What does a code like `UN:ara-Arab:Latn:2017` mean?
- Can I rely on `proposed` codes in production?
- How do I cite a register entry?

### For authorities
- My authority is not listed. How do we join?
- How do I add a new system to my authority?
- What evidence do we need to provide?
- How long does approval take?
- Can we update an existing system code?

### For managers (ISO/TC 46/AG)
- What is the bimonthly meeting cadence?
- How are decisions made?
- Where are the meeting minutes?

## Acceptance

- [ ] All listed questions have answers (≥ 100 words each)
- [ ] `FAQPage` JSON-LD validates via Schema.org validator
- [ ] Search box filters questions with no flicker
- [ ] Page is linked from the global footer and the apply/learn sections
