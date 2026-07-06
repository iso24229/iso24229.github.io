import { describe, it, expect } from 'vitest';
import { RegisterIndex } from './RegisterIndex';
import { SystemCode } from '../items/SystemCode';
import { Authority } from '../items/Authority';

const ts = new Date('2026-07-05T00:00:00Z');

// Fixture data simulating a small register.
const fixtures = {
  authority: [
    { id: 'acadsin', data: { uuid: 'acadsin', authorityIdentifier: 'acadsin', name: 'Academia Sinica', remarks: '', createdAt: ts, updatedAt: ts } },
  ],
  'code-status': [
    { id: 'stable', data: { uuid: 'stable', codeStatus: 'stable', remarks: '', createdAt: ts, updatedAt: ts } },
    { id: 'proposed', data: { uuid: 'proposed', codeStatus: 'proposed', remarks: '', createdAt: ts, updatedAt: ts } },
  ],
  'system-status': [
    { id: 'historical', data: { uuid: 'historical', systemStatus: 'historical', remarks: '', createdAt: ts, updatedAt: ts } },
  ],
  'spelling-system': [
    { id: 'zho-Hani', data: { uuid: 'zho-Hani', languageCode: 'zho', scriptCode: 'Hani', countryCode: null, extension: '', remarks: '', createdAt: ts, updatedAt: ts } },
  ],
  'system-code': [
    {
      id: 'acadsin_zho-Hani_Latn_2002',
      data: {
        uuid: 'acadsin_zho-Hani_Latn_2002',
        code: 'acadsin:zho-Hani:Latn:2002',
        name: 'Academia Sinica -- Tongyong Pinyin',
        description: 'Romanisation of Mandarin Chinese.',
        authority: 'acadsin',
        sourceSpelling: 'zho-Hani',
        sourceScriptCode: null,
        targetSpelling: null,
        targetScriptCode: 'Latn',
        identifyingSegment: '2002',
        relations: [],
        codeStatus: 'stable',
        systemStatus: 'historical',
        remarks: '',
        createdAt: ts,
        updatedAt: ts,
      },
    },
  ],
  'system-relation': [],
  'system-relation-type': [],
} as const;

describe('RegisterIndex', () => {
  const index = RegisterIndex.load(async (slug) => {
    const list = fixtures[slug as keyof typeof fixtures] ?? [];
    return list.map((e) => ({ id: e.id, data: e.data as unknown }));
  });

  it('resolves an authority by uuid', async () => {
    const idx = await index;
    const auth = idx.byUuid('authority', 'acadsin');
    expect(auth?.displayName).toBe('Academia Sinica');
  });

  it('resolves a system-code by its full code', async () => {
    const idx = await index;
    const sc = idx.systemCodeByCode('acadsin:zho-Hani:Latn:2002');
    expect(sc).toBeDefined();
    expect(sc?.name).toBe('Academia Sinica -- Tongyong Pinyin');
  });

  it('resolves the authority of a system-code', async () => {
    const idx = await index;
    const sc = idx.systemCodeByCode('acadsin:zho-Hani:Latn:2002') as SystemCode;
    const auth = idx.authorityOf(sc);
    expect(auth?.authorityIdentifier).toBe('acadsin');
  });

  it('resolves the source spelling of a system-code', async () => {
    const idx = await index;
    const sc = idx.systemCodeByCode('acadsin:zho-Hani:Latn:2002') as SystemCode;
    const src = idx.sourceSpellingOf(sc);
    expect(src?.displayName).toBe('zho-Hani');
  });

  it('returns null for targetSpelling when bare-script is used', async () => {
    const idx = await index;
    const sc = idx.systemCodeByCode('acadsin:zho-Hani:Latn:2002') as SystemCode;
    expect(idx.targetSpellingOf(sc)).toBeNull();
  });

  it('returns systems for an authority', async () => {
    const idx = await index;
    const auth = idx.byUuid('authority', 'acadsin') as Authority;
    const systems = idx.systemsOfAuthority(auth);
    expect(systems).toHaveLength(1);
    expect(systems[0].code).toBe('acadsin:zho-Hani:Latn:2002');
  });
});
