import {
  IRArgs,
  Instruction,
  Operation,
  ParseError,
  TokenMap,
  Type,
  isLabeledOperation,
  isNumericOperation,
  isTypeOperation,
} from './interfaces';
import { parseNossembly } from './parseNossembly';
import { generateToken, parseRaw } from './parseRaw';
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

    const types: Record<string, string> = structuredClone(Type);

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
      const prefix =
        indent && op.instruction !== Instruction.Label ? ' ' : undefined;

      const line: (string | number | undefined)[] = [prefix, name];

      if (isTypeOperation(op)) {
        const typeName =
          Object.entries(types).find(([_k, v]) => v === op.argument)?.[0] ??
          `Type${generateToken(Object.keys(types).length - Object.keys(Type).length)}`;
        types[typeName] ??= op.argument;
        line.push(typeName);
      } else {
        line.push(op.argument);
      }

      lines.push(line.filter((x) => x !== undefined).join(' '));
    }

    return lines.join('\n') + '\n';
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
