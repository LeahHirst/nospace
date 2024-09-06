import { EffectGraphNode } from "../effectGraph";

export function diagram(rootNode: EffectGraphNode) {
  const connections: string[] = [];
  const nodeNames = new Map<EffectGraphNode, string>();

  const visitedNamedNodes = new Set<EffectGraphNode>();
  function nameNodes(node = rootNode) {
    if (visitedNamedNodes.has(node)) {
      return;
    }
    visitedNamedNodes.add(node);

    const name = `${node.effect.effectType}_${node.effect.type}_${nodeNames.size}`;
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
      connections.push(`${name} -> ${childName}`);
      drawConnections(child);
    }
  }
  drawConnections();

  return `@startuml
digraph G {
  ${connections.join('\n  ')}
}
@enduml`;
}
