import {
  IRArgs,
  Instruction,
  Operation,
  ParseError,
  TokenMap,
  isLabeledOperation,
  isNumericOperation,
  isTypeOperation,
} from './interfaces';
import { parseNossembly } from './parseNossembly';
import { parseRaw } from './parseRaw';
import { irToNospace, irToWhitespace, serializeNumber } from './utils';

export class NospaceIR {
  public readonly operations: Operation[];

  public readonly tokens: TokenMap;

  public readonly parseErrors: ParseError[];

  private constructor({ operations, tokens, parseErrors }: IRArgs) {
    this.operations = operations;
    this.tokens = tokens;
    this.parseErrors = parseErrors;
  }

  toNossembly() {
    const instructionNames = Object.fromEntries(
      Object.entries(Instruction).map(([k, v]) => [v, k]),
    );

    let indent = false;
    const lines = [];

    for (const op of this.operations) {
      const name = instructionNames[op.instruction];

      if (op.instruction === Instruction.Label) {
        indent = true;
        if (lines.length > 0) {
          lines.push('');
        }
      }
      const prefix = indent && op.instruction !== Instruction.Label ? '  ' : '';
      lines.push([prefix, name, op.argument].filter(Boolean).join(' '));
    }

    return lines.join('\n');
  }

  toWhitespace() {
    return irToWhitespace(
      this.operations
        .filter(
          (x) =>
            ![Instruction.Cast, Instruction.Assert].includes(x.instruction),
        )
        .map((x) => this.normalizeOperation(x).filter(Boolean).join(''))
        .join(''),
    );
  }

  toNospace() {
    return irToNospace(
      this.operations
        .map((x) => this.normalizeOperation(x).filter(Boolean).join(''))
        .join(''),
    );
  }

  static fromNossembly(nossembly: string): NospaceIR {
    const args = parseNossembly(nossembly);
    return new NospaceIR(args);
  }

  static fromWhitespace(whitespace: string): NospaceIR {
    const args = parseRaw(whitespace, true);
    return new NospaceIR(args);
  }

  static fromNospace(nospace: string): NospaceIR {
    const args = parseRaw(nospace, false);
    return new NospaceIR(args);
  }

  private normalizeOperation(
    operation: Operation,
  ): [Instruction, string | undefined] {
    if (isTypeOperation(operation)) {
      return [operation.instruction, operation.argument];
    }

    if (isNumericOperation(operation)) {
      return [operation.instruction, serializeNumber(operation.argument)];
    }

    if (isLabeledOperation(operation)) {
      return [operation.instruction, this.tokens.get(operation.argument)];
    }

    return [operation.instruction, undefined];
  }
}

export default NospaceIR;
