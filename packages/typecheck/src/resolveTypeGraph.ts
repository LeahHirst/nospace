import { Type } from '@repo/parser';
import type { EffectGraphNode } from './effectGraph';
import type {
  PushEffect,
  StackEffect,
  TypeError,
  TypeWarning,
} from './interfaces';

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

  if (
    node.effect.effectType === 'assert' &&
    !Array.from(node.parents.values())
      .filter(
        (x) => x.effect.effectType === 'push' && x.effect.type !== Type.Never,
      )
      .every(
        (x: any) =>
          x.effect.type === Type.Any ||
          (node.effect as any).type === Type.Any ||
          x.effect.type === (node.effect as any).type,
      )
  ) {
    return false;
  }

  for (const parent of node.parents) {
    if (
      parent.effect.effectType !== 'push' ||
      parent.effect.type === Type.Never ||
      (parent.effect.type === Type.Unknown && node.effect.type !== Type.Unknown)
    ) {
      continue;
    }

    if (
      parent.effect.type !== Type.Any &&
      node.effect.type !== Type.Any &&
      node.effect.type !== Type.Unknown &&
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

function buildTypeError(node: EffectGraphNode, strictMode = false): TypeError {
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
      node,
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
      node,
    };
  }

  if (
    strictMode &&
    node.effect.effectType === 'pop' &&
    Array.from(node.parents).some(
      (parent) =>
        parent.effect.effectType === 'push' &&
        parent.effect.type === Type.Unknown,
    )
  ) {
    return {
      type: 'strict_mode_violation',
      message:
        'When using strict mode, all types pushed to the stack must be cast prior to use',
      meta: node.meta ?? EMPTY_META,
      node,
    };
  }

  return {
    type: 'mismatch',
    message: `Cannot perform ${node.meta?.instructionName.toLowerCase()} as the top item on the stack is of type "${unionedTypes}".\n\n${origins}`,
    meta: node.meta ?? EMPTY_META,
    node,
  };
}

export function resolveTypeGraph(
  rootNode: EffectGraphNode<StackEffect>,
  strictMode = false,
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
      return Array.from(nodesToResolve).map((node) =>
        buildTypeError(node, strictMode),
      );
    }
  }

  return [];
}

export function generateWarnings(
  rootNode: EffectGraphNode<StackEffect>,
): TypeWarning[] {
  const warnings: TypeWarning[] = [];
  const visited = new Set<EffectGraphNode<StackEffect>>();

  const queue = [rootNode];
  while (queue.length > 0) {
    const node = queue.shift()!;
    visited.add(node);
    if (
      node.effect.effectType === 'pop' &&
      Array.from(node.parents).some(
        (p) => p.effect.effectType === 'push' && p.effect.type === Type.Never,
      )
    ) {
      warnings.push({
        type: 'underflow_warn',
        message: `Performing ${node.meta?.instructionName.toLowerCase()} may result in a stack underflow.`,
        meta: node.meta ?? EMPTY_META,
        node,
      });
    }
    Array.from(node.children)
      .filter((n) => !visited.has(n))
      .forEach((n) => queue.push(n));
  }

  return warnings;
}
