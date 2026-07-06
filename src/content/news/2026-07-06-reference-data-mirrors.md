---
title: 'ISO 639 and ISO 15924 reference datasets now mirrored under the iso24229 org'
date: 2026-07-06
summary: 'We have stood up two new public repos — iso639-data and iso15924-data — that auto-sync weekly from LOC, SIL, and the Unicode Consortium, with JSON Schema validation in CI.'
author: 'CalConnect (ISO 24229/RA)'
tags: ['announcement', 'reference-data', 'iso-639', 'iso-15924']
---

ISO 24229 codes reference ISO 639 (language) and ISO 15924 (script)
codes. To make those references verifiable and machine-friendly, we've
stood up two public reference-data repos:

- [**iso24229/iso639-data**](https://github.com/iso24229/iso639-data) —
  ISO 639 parts 1, 2, 3, and 5. Currently 8 625 codes (183 alpha-2
  derived, 487 alpha-2/-2T, 7 929 SIL, 26 family codes from LOC).
- [**iso24229/iso15924-data**](https://github.com/iso24229/iso15924-data) —
  226 script codes from the Unicode Consortium.

## How they work

- One YAML file per code.
- A weekly GitHub Actions cron job re-syncs from each upstream source
  (Library of Congress, SIL, Unicode Consortium).
- The cron **always** commits a `last-checked-date.txt` heartbeat, even
  when nothing has changed upstream, so GitHub doesn't disable the
  schedule after 60 idle days.
- Each entry is validated against a JSON Schema (stored in YAML) via
  `ajv` in a separate workflow that runs on every push and PR.

## Caveat

ISO 639-5 coverage is limited to the 26 codes the Library of Congress
publishes in machine-readable form. The full ~119-code list is not
available as a download from LOC; the `php/iso639-5form.php` endpoint
has been returning 404 for years. We welcome contributions of
additional codes via PR.

## How to consume

The website pulls both repos at build time (per
[`external-sources.yaml`](https://github.com/iso24229/iso24229.github.io/blob/main/external-sources.yaml)).
The [/apply/validate/](/apply/validate/) page inlines the code lists so
submitters can confirm their ISO 639 and ISO 15924 codes before opening
a registration issue.
