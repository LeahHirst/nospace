import { EffectGraphNode, buildEffectGraph } from "./effectGraph";
import { AddEffect, Branch, Type } from "./interfaces";
import { getNthAncestors } from "./utils/graph";

export class Typecheck {
  public graphRoot: EffectGraphNode;

  private managedUnionTypes = new Map<EffectGraphNode, Set<string>>();

  private swappedTypes = new Map<EffectGraphNode, Set<string>>();

  constructor(branches: Branch[]) {
    const root = buildEffectGraph(branches);
    if (!root) {
      throw new Error("Could not build type graph");
    }
    this.graphRoot = root;
  }

  public run() {
    try {
      this.flattenGraph();
      return true;
    } catch (e) {
      return false;
    }
  }

  private locateNodesToResolve() {
    const visited = new Set<EffectGraphNode>();
    const nodes = new Set<EffectGraphNode>();
    const queue = [this.graphRoot];
    while (queue.length > 0) {
      const node = queue.shift()!;
      if (visited.has(node)) {
        continue;
      }
      visited.add(node);
      if (node.effect.effectType !== "add") {
        nodes.add(node);
      }
      queue.push(...node.children);
    }
    return nodes;
  }

  private flattenGraph() {
    const nodesToResolve = this.locateNodesToResolve();

    while (nodesToResolve.size > 0) {
      let progressed = false;
      for (const node of nodesToResolve) {
        if (this.resolves(node, nodesToResolve)) {
          progressed = true;
          nodesToResolve.delete(node);
        }
      }
      if (!progressed) {
        throw new Error("TypeError: Failed to resolve all nodes");
      }
    }
  }

  private resolves(
    node: EffectGraphNode,
    nodesToResolve: Set<EffectGraphNode>,
  ) {
    if (node.effect.effectType === "swap") {
      const swappedTypes = this.swappedTypes.get(node) ?? new Set();
      for (const parent of node.parents) {
        if (parent.effect.effectType !== "add") {
          continue;
        }
        for (const grandparent of parent.parents) {
          if (grandparent.effect.effectType !== "add") {
            continue;
          }

          const key = [grandparent.effect.type, parent.effect.type].join("-");
          if (swappedTypes.has(key)) {
            continue;
          }
          swappedTypes.add(key);

          const newGrandparent: EffectGraphNode = {
            effect: {
              effectType: "add",
              type: parent.effect.type,
            },
            parents: new Set(),
            children: new Set(),
          };
          const newParent: EffectGraphNode = {
            effect: {
              effectType: "add",
              type: grandparent.effect.type,
            },
            parents: new Set(),
            children: new Set(),
          };
          newGrandparent.children.add(newParent);
          newParent.parents.add(newGrandparent);

          for (const child of node.children) {
            newParent.children.add(child);
            child.parents.add(newParent);
          }
          for (const greatGrandParent of grandparent.parents) {
            greatGrandParent.children.add(newGrandparent);
            newGrandparent.parents.add(greatGrandParent);
          }
        }
      }
      this.swappedTypes.set(node, swappedTypes);
      return true;
    }

    if (node.effect.effectType === "copy") {
      const typeNodes = getNthAncestors(
        node,
        node.effect.index + 1,
        (n) => n === node || n.effect.effectType === "add",
      );
      if (typeNodes.length === 0) {
        return false;
      }

      for (const typeNode of typeNodes as EffectGraphNode<AddEffect>[]) {
        if (this.hasUnionType(typeNode.effect.type, node)) {
          continue;
        }

        const unionTypeNode = this.createUnionTypeNode(
          typeNode.effect.type,
          node,
        );
      }

      return true;
    }

    let hasResolved = false;
    for (const parent of node.parents) {
      if (
        parent.effect.effectType !== "add" ||
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
      node.propegate = true;

      if (node.effect.effectType === "assert") {
        // link parent to children
        for (const child of node.children) {
          if (
            child.effect.effectType !== "add" &&
            parent.effect.effectType === "add" &&
            !child.parents.has(parent)
          ) {
            nodesToResolve.add(child);
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
            child.effect.effectType !== "add" &&
            grandparent.effect.effectType === "add" &&
            !child.parents.has(grandparent)
          ) {
            nodesToResolve.add(child);
          }

          grandparent.children.add(child);
          child.parents.add(grandparent);
        }
      }
    }

    return hasResolved;
  }

  private collectChildren(
    node: EffectGraphNode,
    visited = new Set<EffectGraphNode>(),
  ): EffectGraphNode[] {
    return [...node.children].flatMap((child) => {
      if (visited.has(child)) {
        return [];
      }
      visited.add(child);
      return [child, ...this.collectChildren(child, visited)];
    });
  }

  private createUnionTypeNode(type: string, owner: EffectGraphNode) {
    const typeSet = this.managedUnionTypes.get(owner) ?? new Set();
    typeSet.add(type);
    this.managedUnionTypes.set(owner, typeSet);
    return {
      effect: {
        effectType: "add",
        type,
      },
      parents: new Set(),
      children: new Set(),
    };
  }

  private hasUnionType(type: string, owner: EffectGraphNode) {
    return this.managedUnionTypes.get(owner)?.has(type) ?? false;
  }
}
