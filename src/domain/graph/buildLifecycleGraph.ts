/**
 * Builds a `LifecycleGraph` descriptor (nodes + edges) for a given
 * system-code by walking `RegisterIndex`.
 *
 * Pure function — no rendering concerns. The `<LifecycleGraph />`
 * component takes the descriptor and renders SVG.
 *
 * Truncates at depth 1 (the system's immediate relations) to keep
 * the graph readable.
 */
import type { RegisterIndex } from '../register/RegisterIndex';
import type { SystemCode } from '../items/SystemCode';
import type { SpellingSystem } from '../items/SpellingSystem';

export interface GraphNode {
  id: string;
  label: string;
  href: string;
  kind: 'self' | 'source' | 'target' | 'relation';
}

export interface GraphEdge {
  from: string;
  to: string;
  label?: string;
}

export interface LifecycleGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function buildLifecycleGraph(
  index: RegisterIndex,
  center: SystemCode,
): LifecycleGraph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  nodes.push({
    id: center.uuid,
    label: center.code,
    href: `/register/system-code/i/${center.uuid}`,
    kind: 'self',
  });

  const sourceSp = center.sourceSpelling
    ? index.sourceSpellingOf(center)
    : null;
  if (sourceSp && isSpelling(sourceSp)) {
    nodes.push({
      id: sourceSp.uuid,
      label: sourceSp.displayName,
      href: `/register/spelling-system/i/${sourceSp.uuid}`,
      kind: 'source',
    });
    edges.push({ from: sourceSp.uuid, to: center.uuid, label: 'source' });
  } else if (center.sourceScriptCode) {
    nodes.push({
      id: `script:${center.sourceScriptCode}`,
      label: center.sourceScriptCode,
      href: `/reference/script/${center.sourceScriptCode}`,
      kind: 'source',
    });
    edges.push({ from: `script:${center.sourceScriptCode}`, to: center.uuid, label: 'source' });
  }

  const targetSp = center.targetSpelling
    ? index.targetSpellingOf(center)
    : null;
  if (targetSp && isSpelling(targetSp)) {
    nodes.push({
      id: targetSp.uuid,
      label: targetSp.displayName,
      href: `/register/spelling-system/i/${targetSp.uuid}`,
      kind: 'target',
    });
    edges.push({ from: center.uuid, to: targetSp.uuid, label: 'target' });
  } else if (center.targetScriptCode) {
    nodes.push({
      id: `script:${center.targetScriptCode}`,
      label: center.targetScriptCode,
      href: `/reference/script/${center.targetScriptCode}`,
      kind: 'target',
    });
    edges.push({ from: center.uuid, to: `script:${center.targetScriptCode}`, label: 'target' });
  }

  for (const rel of index.relationsOf(center)) {
    nodes.push({
      id: rel.uuid,
      label: rel.type,
      href: `/register/system-relation/i/${rel.uuid}`,
      kind: 'relation',
    });
    edges.push({ from: rel.uuid, to: center.uuid, label: rel.type });
  }

  return { nodes, edges };
}

function isSpelling(x: unknown): x is SpellingSystem {
  return x !== null && typeof x === 'object' && 'displayName' in x;
}
