import { describe, it, expect } from 'vitest';
import { SystemCode } from './SystemCode';

describe('SystemCode', () => {
  const baseProps = {
    uuid: 'acadsin_zho-Hani_Latn_2002',
    remarks: '',
    createdAt: new Date('2026-07-05T00:00:00Z'),
    updatedAt: new Date('2026-07-05T00:00:00Z'),
    name: 'Academia Sinica Tongyong Pinyin',
    description: null,
    authority: 'acadsin',
    sourceSpelling: 'zho-Hani',
    sourceScriptCode: null,
    targetSpelling: null,
    targetScriptCode: 'Latn',
    identifyingSegment: '2002',
    relations: [],
    codeStatus: 'proposed',
    systemStatus: 'historical',
  } as const;

  it('constructs with all required fields', () => {
    const sc = new SystemCode(
      baseProps.uuid, baseProps.remarks, baseProps.createdAt, baseProps.updatedAt,
      'acadsin:zho-Hani:Latn:2002',
      baseProps.name, baseProps.description, baseProps.authority,
      baseProps.sourceSpelling, baseProps.sourceScriptCode,
      baseProps.targetSpelling, baseProps.targetScriptCode,
      baseProps.identifyingSegment, baseProps.relations,
      baseProps.codeStatus, baseProps.systemStatus,
    );
    expect(sc.itemClass).toBe('system-code');
    expect(sc.code).toBe('acadsin:zho-Hani:Latn:2002');
    expect(sc.titularSegment).toBe('acadsin');
    expect(sc.sourceSegment).toBe('zho-Hani');
    expect(sc.targetSegment).toBe('Latn');
    expect(sc.displayName).toBe(baseProps.name);
  });

  it('throws when code is not 4 colon-separated segments', () => {
    const sc = new SystemCode(
      baseProps.uuid, baseProps.remarks, baseProps.createdAt, baseProps.updatedAt,
      'invalid-code',
      baseProps.name, baseProps.description, baseProps.authority,
      baseProps.sourceSpelling, baseProps.sourceScriptCode,
      baseProps.targetSpelling, baseProps.targetScriptCode,
      baseProps.identifyingSegment, baseProps.relations,
      baseProps.codeStatus, baseProps.systemStatus,
    );
    expect(() => sc.codeSegments).toThrow(/4 segments/);
  });
});
