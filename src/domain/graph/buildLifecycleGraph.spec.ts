import { describe, it, expect } from 'vitest';
import { buildLifecycleGraph } from './buildLifecycleGraph';
import type { RegisterIndex } from '../register/RegisterIndex';
import { SystemCode } from '../items/SystemCode';

const ts = new Date('2026-07-05T00:00:00Z');

const centerSystem: SystemCode = new SystemCode(
  'acadsin_zho-Hani_Latn_2002', '', ts, ts,
  'acadsin:zho-Hani:Latn:2002',
  'Tongyong Pinyin', null, 'acadsin',
  'zho-Hani', null, null, 'Latn',
  '2002', [], 'stable', 'historical',
);

// Minimal stub of RegisterIndex for graph testing.
class FakeIndex {
  private spelling = new Map([
    ['zho-Hani', { uuid: 'zho-Hani', displayName: 'zho-Hani', itemClass: 'spelling-system' } as const],
  ]);
  private relations = new Map<string, Array<{ uuid: string; type: string; itemClass: 'system-relation' }>>([
    ['acadsin_zho-Hani_Latn_2002', [
      { uuid: 'rel-predecessor', type: 'predecessor', itemClass: 'system-relation' },
    ]],
  ]);

  sourceSpellingOf(sc: SystemCode) {
    return this.spelling.get(sc.sourceSpelling ?? '') ?? null;
  }
  targetSpellingOf(_sc: SystemCode) {
    return null;
  }
  relationsOf(sc: SystemCode) {
    return this.relations.get(sc.uuid) ?? [];
  }
}

describe('buildLifecycleGraph', () => {
  const index = new FakeIndex() as unknown as RegisterIndex;

  it('emits the center node', () => {
    const g = buildLifecycleGraph(index, centerSystem);
    const self = g.nodes.find((n) => n.kind === 'self');
    expect(self?.id).toBe(centerSystem.uuid);
    expect(self?.label).toBe(centerSystem.code);
  });

  it('emits a source-spelling node when sourceSpelling is set', () => {
    const g = buildLifecycleGraph(index, centerSystem);
    const src = g.nodes.find((n) => n.kind === 'source');
    expect(src?.label).toBe('zho-Hani');
  });

  it('emits a target-script node when targetScriptCode is bare', () => {
    const g = buildLifecycleGraph(index, centerSystem);
    const tgt = g.nodes.find((n) => n.kind === 'target');
    expect(tgt?.label).toBe('Latn');
    expect(tgt?.id).toBe('script:Latn');
  });

  it('includes relation nodes', () => {
    const g = buildLifecycleGraph(index, centerSystem);
    const rel = g.nodes.find((n) => n.kind === 'relation');
    expect(rel?.label).toBe('predecessor');
  });
});
