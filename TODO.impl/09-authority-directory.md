# 9. Authority directory (`/register/authority/`)

## Goal

Each `authority` entry has its own public page showing the authority's name, address, the two named authorised persons, contact details, and the list of system-codes that authority manages. All authority data is sourced from the register YAMLs (one file per authority) — no duplication.

## Schema additions (in `iso24229-register`)

```yaml
# iso24229-register/authority/acadsin.yaml
authorityIdentifier: acadsin
name: Academia Sinica
address:
  street: 128 Academia Road, Section 2, Nankang
  city: Taipei
  country: TW      # ISO 3166-1
  postalCode: '11529'
contact:
  email: open@ribose.com   # placeholder — must be a real authority address
  url: https://www.sinica.edu.tw/
authorisedPersons:
  - name: '<person 1>'
    role: '<role>'
    email: '<email>'
  - name: '<person 2>'
    role: '<role>'
    email: '<email>'
remarks: ''
createdAt: 2026-07-05T00:00:00Z
updatedAt: 2026-07-05T00:00:00Z
```

The two-authorised-persons requirement is enforced by Zod (length === 2).

## Implementation

1. Update `iso24229-register/SCHEMA.adoc` and the Zod schema in `iso24229.github.io/src/content.config.ts` to include `address` and `authorisedPersons`.
2. Update the existing `authority/acadsin.yaml` and `authority/bgn-pcgn.yaml` to include the new fields (real data, sourced from each authority).
3. Build `src/pages/register/authority/[uuid].astro` rendering the full record plus a list of system-codes for that authority (via `RegisterIndex.byAuthority()`).
4. Build `src/pages/register/authority/index.astro` listing all authorities.
5. Add semantic-data exports per authority page (see [11-semantic-exports.md](./11-semantic-exports.md)).

## Acceptance

- [ ] Zod schema rejects authorities with fewer or more than 2 authorised persons
- [ ] Authority page renders the address as schema.org `PostalAddress` JSON-LD
- [ ] Each authority page links to its systems
- [ ] Directory page sorts alphabetically with a search box
