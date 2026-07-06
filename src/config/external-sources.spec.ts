import { describe, it, expect } from 'vitest';
import { externalSources, sourceByName, resolveSourcePath } from './external-sources';

describe('external-sources config', () => {
  it('lists three sources', () => {
    expect(externalSources).toHaveLength(3);
    const names = externalSources.map((s) => s.name);
    expect(names).toEqual(['iso639-data', 'iso15924-data', 'iso24229-register']);
  });

  it('all sources are pinned to a ref', () => {
    for (const src of externalSources) {
      expect(src.ref.length).toBeGreaterThan(0);
    }
  });

  it('only the register is private', () => {
    expect(sourceByName('iso639-data').private).toBe(false);
    expect(sourceByName('iso15924-data').private).toBe(false);
    expect(sourceByName('iso24229-register').private).toBe(true);
  });

  it('resolveSourcePath prefers a sibling clone when present', () => {
    // On a developer machine with siblings checked out, paths resolve
    // to the sibling — no symlink, no cache directory.
    const resolved = resolveSourcePath('iso639-data');
    expect(resolved.endsWith('iso639-data')).toBe(true);
  });

  it('sourceByName throws on unknown', () => {
    expect(() => sourceByName('does-not-exist')).toThrow(/Unknown external source/);
  });
});
