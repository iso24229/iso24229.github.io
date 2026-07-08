import { describe, it, expect } from 'vitest';
import { externalSources, sourceByName, resolveSourcePath } from './external-sources';

describe('external-sources config', () => {
  it('lists three sources', () => {
    expect(externalSources).toHaveLength(3);
    const names = externalSources.map((s) => s.name);
    expect(names).toEqual(['iso639-data', 'iso15924-data', 'register']);
  });

  it('all sources are pinned to a ref and an npm package', () => {
    for (const src of externalSources) {
      expect(src.ref.length).toBeGreaterThan(0);
      expect(src.npmPackage.startsWith('@iso24229/')).toBe(true);
    }
  });

  it('resolveSourcePath points at the installed npm package', () => {
    // With packages installed (CI and dev), paths resolve into
    // node_modules/@iso24229/<name>.
    for (const src of externalSources) {
      const resolved = resolveSourcePath(src.name as any);
      expect(resolved.includes('node_modules')).toBe(true);
      expect(resolved.includes(src.npmPackage)).toBe(true);
    }
  });

  it('sourceByName throws on unknown', () => {
    expect(() => sourceByName('does-not-exist')).toThrow(/Unknown external source/);
  });
});
