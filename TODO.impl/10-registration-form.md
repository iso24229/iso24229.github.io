# 10. Registration form (GitHub issue template)

## Goal

Replace the "email us" path with structured GitHub issue templates that validate ISO 639 and ISO 15924 codes client-side (via the YAML form schema) and require:

- A clear system name and description
- The 639 + 15924 codes for source/target
- A PDF or URL describing how the system works
- Real-world usage evidence (URLs, document references)
- Justification in the style of Unicode's proposal process

## Architecture

Two issue templates live in `.github/ISSUE_TEMPLATE/` in the `iso24229-register` repo (where submissions belong):

- `register-new-system.yml` — for existing authorities adding a new system
- `apply-new-authority.yml` — for new authorities applying to join the register

Each is a GitHub YAML form with `validations` on required fields. The `iso639-data` and `iso15924-data` repos power a separate client-side validator (a static page at `/apply/validate/`) that confirms codes exist before the user submits.

## Implementation

1. Write `.github/ISSUE_TEMPLATE/register-new-system.yml` in the `iso24229-register` repo with the fields above.
2. Write `.github/ISSUE_TEMPLATE/apply-new-authority.yml` (asks for authority name, address, two authorised persons, evidence of competence).
3. Build `src/pages/apply/validate/index.astro` — a client-side form that:
   - Loads `external/iso639-data` and `external/iso15924-data` manifest files at build time (small, ~50KB total).
   - Lets the user type a code; shows green/red validity check.
   - Generates a pre-filled GitHub-issue URL when all fields are valid.
4. Add a "Submit a new system" CTA on every system-code detail page that pre-fills the form with that system's authority.

## Form fields (`register-new-system.yml`)

| Field | Type | Validation |
| --- | --- | --- |
| System name | textarea | required, ≥ 10 chars |
| Description | textarea | required, ≥ 200 chars |
| Authority | dropdown (existing authorities + "New authority") | required |
| Source language (ISO 639) | text | required, must exist in `iso639-data` |
| Source script (ISO 15924) | text | required, must exist in `iso15924-data` |
| Target language (ISO 639) | text | optional |
| Target script (ISO 15924) | text | required |
| Identifying segment | text | required (e.g. `2017`, `9-1995`) |
| Specification PDF | file | required |
| Real-world usage evidence | textarea (URLs, one per line) | required, ≥ 1 URL |
| Justification | textarea | required, ≥ 200 chars |

## Acceptance

- [ ] Issue templates render correctly on GitHub
- [ ] `/apply/validate/` page loads instantly (data manifest inlined at build)
- [ ] All sample 639/15924 codes validated correctly
- [ ] Generated issue URL deep-links to the form with prefilled body
