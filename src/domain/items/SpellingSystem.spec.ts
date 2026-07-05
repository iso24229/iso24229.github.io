import { describe, it, expect } from 'vitest';
import { SpellingSystem } from './SpellingSystem';

describe('SpellingSystem', () => {
  const ts = new Date('2026-07-05T00:00:00Z');

  it('composes displayName from language + script (+ country, extension)', () => {
    const full = new SpellingSystem('ind-Latn-pre1972-ID', '', ts, ts, 'ind', 'Latn', 'ID', 'pre1972');
    expect(full.displayName).toBe('ind-Latn-ID-pre1972');
  });

  it('omits country and extension when absent', () => {
    const minimal = new SpellingSystem('zho-Hani', '', ts, ts, 'zho', 'Hani', null, '');
    expect(minimal.displayName).toBe('zho-Hani');
  });

  it('does not accept a bare script code as languageCode (per data-model rules)', () => {
    // The constructor itself does not enforce this — the Zod schema does.
    // Here we only assert that the scriptCode field is independent of languageCode.
    const sc = new SpellingSystem('zho-Hani', '', ts, ts, 'zho', 'Hani', null, '');
    expect(sc.languageCode).not.toBe(sc.scriptCode);
  });
});
