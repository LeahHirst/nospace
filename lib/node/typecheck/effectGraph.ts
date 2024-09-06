import { Branch, StackEffect, Type } from "./interfaces";

export type EffectGraphNode = {
  effect: StackEffect;
  parents: Set<EffectGraphNode>;
  children: Set<EffectGraphNode>;
  propegate?: boolean;
}

type NodeFragment = {
  head?: EffectGraphNode,
  tail?: EffectGraphNode
};

export function buildEffectGraph(branches: Branch[]) {
  const branchPointers = new Map<Branch, NodeFragment>();
  const baseNode: EffectGraphNode = {
    effect: {
      effectType: 'add',
      type: Type.Never,
    },
    parents: new Set(),
    children: new Set(),
  }

  const getHeadNodes = (branch: Branch): EffectGraphNode[] => {
    const fragment = branchPointers.get(branch);
    if (!fragment) {
      return [];
    }

    if (!fragment.head) {
      return [...new Set(([branch.controlFlowBranch, branch.nextBranch]
        .filter(Boolean) as Branch[])
        .flatMap(x => getHeadNodes(x)))];
    }

    return [fragment.head];
  };

  for (const branch of branches) {
    const nodes = branch.effects.map(effect => ({
      effect,
      parents: new Set<EffectGraphNode>(),
      children: new Set<EffectGraphNode>(),
    }));
    nodes.forEach((node, i) => {
      if (i > 0) {
        nodes[i - 1].children.add(node);
        node.parents.add(nodes[i - 1]);
      }
    });
    branchPointers.set(branch, { head: nodes[0], tail: nodes[nodes.length - 1] });
  }

  // Connect branches
  for (const branch of branches) {
    if (branch.callsSubroutine || branch.returns) {
      throw new Error('Not yet implemented');
    }
    
    const fragment = branchPointers.get(branch)!;

    if (!fragment.tail) {
      continue;
    }

    const children = [
      branch.controlFlowBranch,
      branch.callsSubroutine ? undefined : branch.nextBranch,
    ]
      .filter(Boolean)
      .flatMap(x => getHeadNodes(x as Branch));

    for (const child of children) {
      fragment.tail.children.add(child);
      child.parents.add(fragment.tail);
    }

    if (branch.callsSubroutine && branch.nextBranch) {
      for (const returnBranch of findReturns(branch.controlFlowBranch!)) {
        const returnFragment = branchPointers.get(returnBranch)!;
        if (!returnFragment.tail) {
          continue;
        }
        const headNodes = getHeadNodes(branch.nextBranch!);
        for (const child of headNodes) {
          returnFragment.tail.children.add(child);
          child.parents.add(returnFragment.tail);
        }
      }
    }
  }

  const baseChildren = getHeadNodes(branches[0]);
  for (const child of baseChildren) {
    baseNode.children.add(child);
    child.parents.add(baseNode);
  }
  return baseNode;
}

function findReturns(branch: Branch, visited = new Set<Branch>()): Branch[] {
  if (visited.has(branch)) {
    return [];
  }
  visited.add(branch);

  if (branch.returns) {
    return [branch];
  }

  return [
    ...findReturns(branch.controlFlowBranch!, visited),
    ...findReturns(branch.nextBranch!, visited),
  ];
}
