# 14. Test suite

## Goal

Specs throughout, per the global code-quality rules. Vitest for unit tests, Playwright for the few end-to-end flows that matter (search, register navigation, form validation).

## Architecture

- `vitest.config.ts` at the root.
- Spec files colocated with sources: `src/domain/items/SystemCode.spec.ts`.
- One spec per public method per class. Edge cases covered.
- No mocks of the domain layer — use real instances built from fixture YAMLs.
- E2E specs (Playwright) live under `e2e/` and only cover critical paths.

## Coverage targets

| Layer | Coverage |
| --- | --- |
| `src/domain/**` | ≥ 90% lines, 100% of public methods |
| `src/semantic/**` | ≥ 85% lines |
| `src/loaders/**` | ≥ 80% lines |
| `src/components/**` | unit-testable pure components only |

## Implementation

1. `pnpm add -D vitest @vitest/coverage-v8 playwright @playwright/test`
2. `vitest.config.ts` with coverage thresholds.
3. Specs for each domain class — construction, validation failure modes, equality.
4. Spec for `RegisterIndex` — fixture YAMLs in `test/fixtures/`, build index, run lookups.
5. Spec for each `SemanticExporter` subclass — known-item, expected-output snapshot.
6. `e2e/register.spec.ts` — home → register → system-code detail → graph renders.
7. `e2e/apply.spec.ts` — apply/validate form flow.
8. Add `pnpm test` and `pnpm test:e2e` scripts; CI runs unit tests on every PR.

## Acceptance

- [ ] `pnpm test` is green
- [ ] Coverage thresholds enforced in CI
- [ ] E2E tests run in CI on every PR (parallelised)
- [ ] A spec exists for every public method on every domain class
