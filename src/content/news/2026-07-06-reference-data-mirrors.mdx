---
title: 'ISO 639 and ISO 15924 reference datasets now available under the iso24229 organisation'
date: 2026-07-06
summary: 'Two new public repositories — iso639-data and iso15924-data — synchronise weekly from the Library of Congress, SIL International, and the Unicode Consortium, with JSON Schema validation in continuous integration.'
author: 'CalConnect (ISO 24229/RA)'
tags: ['announcement', 'reference-data', 'iso-639', 'iso-15924']
---

ISO 24229 codes reference ISO 639 (language) and ISO 15924 (script)
codes. To ensure those references are verifiable and machine-readable,
the Registration Authority has published two public reference-data
repositories:

- [**iso24229/iso639-data**](https://github.com/iso24229/iso639-data) —
  ISO 639 parts 1, 2, 3, and 5. Currently 8 625 codes (183 alpha-2
  derived, 487 alpha-2/-2T, 7 929 SIL, 26 family codes from the Library
  of Congress).
- [**iso24229/iso15924-data**](https://github.com/iso24229/iso15924-data) —
  226 script codes from the Unicode Consortium.

## Synchronisation

- One YAML file per code.
- A weekly GitHub Actions workflow re-synchronises from each upstream
  source (Library of Congress, SIL International, Unicode Consortium).
- The workflow commits a `last-checked-date.txt` heartbeat on every run,
  even when no upstream changes are detected, to prevent GitHub from
  disabling the schedule after 60 idle days.
- Each entry is validated against a JSON Schema (stored in YAML format)
  via `ajv` in a separate workflow that runs on every push and pull
  request.

## Limitations

ISO 639-5 coverage is limited to the 26 codes the Library of Congress
publishes in machine-readable form. The complete list of approximately
119 codes is not available as a download from the Library of Congress;
the `php/iso639-5form.php` endpoint has been returning 404 for several
years. Contributions of additional codes are welcome via pull request.

## Consumption

The website incorporates both repositories at build time (per
[`external-sources.yaml`](https://github.com/iso24229/iso24229.github.io/blob/main/external-sources.yaml)).
The interactive submission form at
[/about/apply/submit](/about/apply/submit) provides searchable dropdowns
of ISO 639 and ISO 15924 codes so submitters can confirm their
identifiers before opening a proposal.
