import { NospaceIR } from '@repo/parser';
import type { TypeError, TypeWarning } from './interfaces';
import { extractBranches } from './branches';
import { buildEffectGraph, EffectGraphNode } from './effectGraph';
import { generateWarnings, resolveTypeGraph } from './resolveTypeGraph';

export class Typechecker {
  public rootNode?: EffectGraphNode;

  constructor(public ir: NospaceIR) {}

  typecheck(
    strictMode = false,
  ): [boolean, { errors: TypeError[]; warnings: TypeWarning[] }] {
    const branches = extractBranches(this.ir.operations);
    this.rootNode = buildEffectGraph(branches, strictMode);

    const errors = resolveTypeGraph(this.rootNode, strictMode);
    const warnings = generateWarnings(this.rootNode);

    return [errors.length === 0, { errors, warnings }];
  }
}
