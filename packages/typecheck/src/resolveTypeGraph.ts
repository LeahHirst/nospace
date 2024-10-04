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

const EMPTY_META = {
  startLn: 0,
  startCol: 0,
  endLn: 0,
  endCol: 0,
  instructionName: '',
};

function buildTypeError(node: EffectGraphNode): TypeError {
  const stackTypes = Array.from(
    new Set(
      Array.from(node.parents)
        .filter((x) => x.effect.effectType === 'push' && !!x.meta)
        .sort((a, b) => (a.meta?.startLn ?? 0) - (b.meta?.startLn ?? 0)),
    ),
  ) as unknown as EffectGraphNode<PushEffect>[];

  if (stackTypes.length === 0) {
    return {
      type: 'underflow',
      message: `Cannot perform ${node.meta?.instructionName.toLowerCase()} as this would result in a stack underflow.`,
      meta: node.meta ?? EMPTY_META,
    };
  }

  const origins = stackTypes
    .map(
      (x) =>
        `"${x.meta?.typeName}" comes from L${(x.meta?.startLn ?? 0) + 1}:${x.meta?.startCol ?? 0}.`,
    )
    .join('\n');
  const unionedTypes = stackTypes.map((x) => x.meta?.typeName).join(' | ');

  if (node.effect.effectType === 'assert') {
    return {
      type: 'mismatch',
      message: `Attempted to assert type "${node.meta?.typeName}", but the top item of the stack is of type "${unionedTypes}".\n\n${origins}`,
      meta: node.meta ?? EMPTY_META,
    };
  }

  return {
    type: 'mismatch',
    message: `Cannot perform ${node.meta?.instructionName.toLowerCase()} as the top item on the stack is of type "${unionedTypes}".\n\n${origins}`,
    meta: node.meta ?? EMPTY_META,
  };
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
      return Array.from(nodesToResolve).map(buildTypeError);
    }
  }

  return [];
}
