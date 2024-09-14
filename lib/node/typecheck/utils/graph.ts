
export function getNthAncestors<T extends { parents: Set<T> }>(node: T, depth: number, matcher?: (v: T) => boolean): T[] {
  if (depth <= 0) {
    if (matcher && !matcher(node)) {
      return [];
    }
    return [node];
  }
  
  if (matcher && !matcher(node)) {
    return [];
  }

  return [...node.parents].flatMap(parent => getNthAncestors(parent, depth - 1, matcher));
}
