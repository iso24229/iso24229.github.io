---
title: 'Register data and schemas now open for public review'
date: 2026-07-06
summary: 'The iso24229-register repo now ships one JSON Schema per item class, validates every YAML entry on push and PR, and accepts submissions via structured GitHub issue templates.'
author: 'CalConnect (ISO 24229/RA)'
tags: ['announcement', 'register-data', 'schemas', 'validation']
---

The [iso24229-register](https://github.com/iso24229/iso24229-register)
repository — the canonical home of the register data — now has:

- **One JSON Schema per item class** (`schema/authority.schema.yaml`,
  `schema/system-code.schema.yaml`, etc.). Stored in YAML format for
  consistency with the data.
- **A validator** (`scripts/validate.mjs`) that runs `ajv` against
  every entry on every push and PR. CI fails on any schema mismatch.
- **Two structured GitHub issue templates**:
  - [`register-new-system.yml`](https://github.com/iso24229/iso24229-register/blob/main/.github/ISSUE_TEMPLATE/register-new-system.yml)
    for existing authorities adding a new system.
  - [`apply-new-authority.yml`](https://github.com/iso24229/iso24229-register/blob/main/.github/ISSUE_TEMPLATE/apply-new-authority.yml)
    for new authorities applying to join.

## Schema highlights

- The `authority` schema enforces the operational requirement that
  every authority designates exactly two authorised persons.
- The `system-code` schema enforces the four-segment colon-form code
  pattern (`titular:source:target:identifying`) from §4 of the standard.
- The `spelling-system` schema requires both an ISO 639 language code
  and an ISO 15924 script code (a bare script code is NOT a spelling
  system; see [/learn/glossary](/learn/glossary)).

## Submissions

Submissions now follow a Unicode-style justification process. Required
fields include the source/target ISO 639 and ISO 15924 codes (validated
client-side at [/apply/validate](/apply/validate) before submission),
a specification document, evidence of real-world usage, and a
justification.

The Advisory Group reviews submissions at its bimonthly meeting.
