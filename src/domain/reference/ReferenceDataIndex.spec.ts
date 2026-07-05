import { describe, it, expect } from 'vitest';
import { ReferenceDataIndex } from './ReferenceDataIndex';

describe('ReferenceDataIndex', () => {
  const idx = ReferenceDataIndex.load();

  it('loads ISO 639 parts and ISO 15924 from the submodules', () => {
    expect(idx.iso639Count).toBeGreaterThan(7000);
    expect(idx.iso15924Count).toBeGreaterThan(200);
  });

  it('resolves English (eng) across ISO 639 parts', () => {
    const hit = idx.iso639('eng');
    expect(hit).toBeDefined();
    expect(hit?.name).toBe('English');
  });

  it('resolves ISO 15924 Latn', () => {
    const hit = idx.iso15924('Latn');
    expect(hit).toBeDefined();
    expect(hit?.number).toBe(215);
    expect(hit?.name).toBe('Latin');
  });

  it('returns undefined for an unknown code', () => {
    expect(idx.iso639('xxx')).toBeUndefined();
    expect(idx.iso15924('Xxxx')).toBeUndefined();
  });
});
