import { describe, it, expect } from 'vitest';
import { itemFactories } from './factories';
import type { ItemClassSlug } from './items/RegisterItem';
import type { SystemCode } from './items/SystemCode';

const ts = '2026-07-05T00:00:00Z';

const sampleInputs: Record<ItemClassSlug, Record<string, unknown>> = {
  authority: {
    uuid: 'acadsin',
    authorityIdentifier: 'acadsin',
    name: 'Academia Sinica',
    address: { street: '128 Academia Rd', city: 'Taipei', country: 'TW', postalCode: '115' },
    contact: { email: 'open@ribose.com' },
    authorisedPersons: [
      { name: 'P1', role: 'Liaison', email: 'p1@x.org' },
      { name: 'P2', role: 'Deputy', email: 'p2@x.org' },
    ],
    remarks: '',
    createdAt: ts,
    updatedAt: ts,
  },
  'code-status': { uuid: 'stable', codeStatus: 'stable', remarks: '', createdAt: ts, updatedAt: ts },
  'spelling-system': { uuid: 'zho-Hani', languageCode: 'zho', scriptCode: 'Hani', countryCode: null, extension: '', remarks: '', createdAt: ts, updatedAt: ts },
  'system-code': {
    uuid: 'acadsin_zho-Hani_Latn_2002',
    code: 'acadsin:zho-Hani:Latn:2002',
    name: 'Tongyong Pinyin',
    description: null,
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
  'system-relation': { uuid: 'rel', type: 'predecessor', targetSystem: 'target', remarks: '', createdAt: ts, updatedAt: ts },
  'system-relation-type': { uuid: 'predecessor', systemRelationType: 'predecessor', remarks: '', createdAt: ts, updatedAt: ts },
  'system-status': { uuid: 'stable', systemStatus: 'stable', remarks: '', createdAt: ts, updatedAt: ts },
};

describe('itemFactories', () => {
  it('covers every item class', () => {
    expect(Object.keys(itemFactories).sort()).toEqual([
      'authority',
      'code-status',
      'spelling-system',
      'system-code',
      'system-relation',
      'system-relation-type',
      'system-status',
    ]);
  });

  describe.each(Object.keys(sampleInputs) as ItemClassSlug[])('%s', (slug) => {
    it('constructs an instance from a parsed YAML shape', () => {
      const item = itemFactories[slug](sampleInputs[slug]);
      expect(item.uuid).toBe(sampleInputs[slug].uuid);
      expect(item.itemClass).toBe(slug);
    });
  });

  it('SystemCode factory preserves the four-segment code', () => {
    const sc = itemFactories['system-code'](sampleInputs['system-code']);
    expect(sc.displayName).toBe('Tongyong Pinyin');
    expect((sc as SystemCode).titularSegment).toBe('acadsin');
  });
});
