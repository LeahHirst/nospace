import { EffectGraphNode } from "../effectGraph";
import { Type } from "../interfaces";

export function diagram(rootNode: EffectGraphNode) {
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
      connections.push(`${name} -> ${childName}`);
      drawConnections(child);
    }
  }
  drawConnections();

  function getType(node: EffectGraphNode) {
    const type = (node.effect as any).type;
    if (!type) {
      return undefined;
    }

    if (Object.values(Type).includes(type)) {
      return Object.entries(Type).find(([_, v]) => v === type)![0];
    }

    return type;
  }

  return `@startuml
digraph G {
  ${[...visitedNodes].map(n => `${nodeNames.get(n)} [label="${n.effect.effectType} ${(getType(n))}"]`).join('\n  ')}
  ${connections.join('\n  ')}
}
@enduml`;
}
