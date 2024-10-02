import { Type } from '@repo/parser';
import type { EffectGraphNode } from './effectGraph';
import type { PushEffect, StackEffect, TypeError } from './interfaces';

function findNodesToResolve(
  rootNode: EffectGraphNode<StackEffect>,
): Set<EffectGraphNode<Exclude<StackEffect, PushEffect>>> {
  const visited = new Set<EffectGraphNode<StackEffect>>();
  const nodesToResolve = new Set<
    EffectGraphNode<Exclude<StackEffect, PushEffect>>
  >();

  const queue = [rootNode];
  while (queue.length > 0) {
    const node = queue.shift()!;
    visited.add(node);
    if (node.effect.effectType !== 'push') {
      nodesToResolve.add(
        node as EffectGraphNode<Exclude<StackEffect, PushEffect>>,
      );
    }
    Array.from(node.children)
      .filter((n) => !visited.has(n))
      .forEach((n) => queue.push(n));
  }

  return nodesToResolve;
}

function resolves(
  node: EffectGraphNode<Exclude<StackEffect, PushEffect>>,
  nodesToResolve: Set<EffectGraphNode<Exclude<StackEffect, PushEffect>>>,
): boolean {
  let hasResolved = false;

  if (node.effect.effectType === 'swap' || node.effect.effectType === 'copy') {
    throw new Error('Not implemented');
  }

  for (const parent of node.parents) {
    if (
      parent.effect.effectType !== 'push' ||
      parent.effect.type === Type.Never
    ) {
      continue;
    }

    if (
      parent.effect.type !== Type.Any &&
      node.effect.type !== Type.Any &&
      parent.effect.type !== node.effect.type
    ) {
      continue;
    }

    hasResolved = true;

    if (node.effect.effectType === 'assert') {
      // link parent to children
      for (const child of node.children) {
        if (
          child.effect.effectType !== 'push' &&
          parent.effect.effectType === 'push' &&
          !child.parents.has(parent)
        ) {
          nodesToResolve.add(
            child as EffectGraphNode<Exclude<StackEffect, PushEffect>>,
          );
        }

        parent.children.add(child);
        child.parents.add(parent);
      }
      continue;
    }

    // link grandparents to children
    for (const grandparent of parent.parents) {
      for (const child of node.children) {
        if (
          child.effect.effectType !== 'push' &&
          grandparent.effect.effectType === 'push' &&
          !child.parents.has(grandparent)
        ) {
          nodesToResolve.add(
            child as EffectGraphNode<Exclude<StackEffect, PushEffect>>,
          );
        }

        grandparent.children.add(child);
        child.parents.add(grandparent);
      }
    }
  }

  return hasResolved;
}

export function resolveTypeGraph(
  rootNode: EffectGraphNode<StackEffect>,
): TypeError[] {
  const nodesToResolve = findNodesToResolve(rootNode);

  while (nodesToResolve.size > 0) {
    let progressed = false;
    for (const node of nodesToResolve) {
      if (resolves(node, nodesToResolve)) {
        progressed = true;
        nodesToResolve.delete(node);
      }
    }
    if (!progressed) {
      return Array.from(nodesToResolve).map((node) => ({
        type: 'mismatch',
        message: `This operation cannot be performed on the stack`,
        meta: node.meta ?? {
          startLn: 0,
          startCol: 0,
          endLn: 0,
          endCol: 0,
        },
      }));
    }
  }

  return [];
}
