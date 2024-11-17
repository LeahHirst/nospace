import { Type } from '@repo/parser';
import { EffectGraphNode } from '../effectGraph';
import { StackEffect } from '../interfaces';

function getLabel(node: EffectGraphNode<StackEffect>) {
  if ((node.effect as any).type === Type.Never) {
    return 'Never';
  }

  if (node.effect.effectType === 'pop') {
    return 'pop';
  }

  return `${node.effect.effectType} ${node.meta?.typeName ?? 'Any'}`;
}

export function diagram(
  rootNode: EffectGraphNode,
  erroredNodes: EffectGraphNode[] = [],
  warningNodes: EffectGraphNode[] = [],
) {
  const connections: string[] = [];
  const nodeNames = new Map<EffectGraphNode, string>();

  const visitedNamedNodes = new Set<EffectGraphNode>();
  function nameNodes(node = rootNode) {
    if (visitedNamedNodes.has(node)) {
      return;
    }
    visitedNamedNodes.add(node);

    const name = `${node.effect.effectType}_${(node.effect as any).type ?? ''}_${nodeNames.size}`;
    nodeNames.set(node, name);
    for (const child of node.children) {
      nameNodes(child);
    }
  }
  nameNodes();

  const visitedNodes = new Set<EffectGraphNode>();
  function drawConnections(node = rootNode) {
    if (visitedNodes.has(node)) {
      return;
    }
    visitedNodes.add(node);

    const name = nodeNames.get(node);
    for (const child of node.children) {
      const childName = nodeNames.get(child);
      connections.push(
        `${name}[${getLabel(node)}] --> ${childName}[${getLabel(child)}]`,
      );
      drawConnections(child);
    }
  }
  drawConnections();

  return `graph TD
  ${[
    connections.length === 0 ? 'Never' : '',
    ...connections,
    erroredNodes.map(
      (x) => `style ${nodeNames.get(x)} stroke:red,fill: #803e3e`,
    ),
    warningNodes.map(
      (x) => `style ${nodeNames.get(x)} stroke:yellow,fill: #806f3e`,
    ),
  ]
    .filter(Boolean)
    .join('\n  ')}`;
}
