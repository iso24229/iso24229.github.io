# 14. Test suite

## Goal

Specs throughout, per the global code-quality rules. Vitest for unit tests.

## Status

| Layer | Coverage |
| --- | --- |
| `src/domain/items/**` | SystemCode, SpellingSystem specs |
| `src/domain/register/**` | RegisterIndex spec (with fixtures) |
| `src/domain/graph/**` | buildLifecycleGraph spec |
| `src/domain/reference/**` | ReferenceDataIndex spec |
| `src/domain/factories.spec` | covers every item-class factory |
| `src/semantic/**` | exporters spec (all three formats) |
| `src/config/external-sources.spec` | covers config loader and path resolver |

**Total: 42 tests, 8 spec files, 0 errors.**

## Architecture

- `vitest.config.ts` at the root.
- Spec files colocated with sources: `src/<dir>/<Module>.spec.ts`.
- One spec per public method per class. Edge cases covered.
- No mocks of the domain layer — use real instances built from fixture YAMLs.
- Coverage thresholds not yet enforced in CI (TODO).

## Implementation

1. ✅ `vitest.config.ts`
2. ✅ Specs for SystemCode, SpellingSystem
3. ✅ Specs for all three semantic exporters
4. ✅ ReferenceDataIndex spec
5. ✅ RegisterIndex spec (fixture-driven)
6. ✅ buildLifecycleGraph spec
7. ✅ external-sources config spec
8. ✅ factories spec (parametrised over item classes)
9. ⏳ Coverage thresholds in vitest config
10. ⏳ CI integration (`pnpm test` on every PR)

## Acceptance

- [x] `pnpm test` is green
- [x] Every domain class has at least one spec
- [x] Every public method on key classes (SystemCode, RegisterIndex, exporters) has a test
- [ ] Coverage thresholds enforced in CI
- [ ] CI runs `pnpm test` on every PR
