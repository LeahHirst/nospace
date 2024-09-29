import { IRArgs, Instruction, Operation, TokenMap, isNumericInstruction } from "./interfaces";
import { parseNossembly } from "./parseNossembly";
import { parseRaw } from "./parseRaw";
import { parseNumber } from "./utils";

export class NospaceIR {
  public readonly operations: Operation[];

  public readonly tokens: TokenMap;

  private constructor({ operations, tokens }: IRArgs) {
    this.operations = operations;
    this.tokens = tokens;
  }

  toNossembly() {
    const instructionNames = Object.fromEntries(
      Object.entries(Instruction).map(([k, v]) => [v, k]),
    );

    let indent = false;
    const lines = [];

    for (const op of this.operations) {
      const name = instructionNames[op.instruction];
      const normalizedArg = this.normalizeArgument(op.instruction, op.argument as string);

      if (op.instruction === Instruction.Label) {
        indent = true;
        if (lines.length > 0) {
          lines.push('');
        }
      }
      const prefix = (indent && op.instruction !== Instruction.Label) ? '  ' : ''
      lines.push([prefix, name, normalizedArg].filter(Boolean).join(' '));
    }

    return lines.join('\n');
  }

  toWhitespace() {
    return this.operations
      .filter(x => ![
        Instruction.Cast,
        Instruction.Assert
      ].includes(x.instruction))
      .map(x => [x.instruction, x.argument].filter(Boolean).join(''))
      .join('')
      .replace(/s/g, ' ')
      .replace(/t/g, '\t')
      .replace(/n/g, '\n');
  }

  toNospace() {
    return this.operations
      .map(x => [x.instruction, x.argument].filter(Boolean).join(''))
      .join('')
      .replace(/s/g, '\u200B')
      .replace(/t/g, '\u200C')
      .replace(/n/g, '\u200D')
      .replace(/x/g, '\u2060');
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

  private normalizeArgument(instruction: Instruction, arg: string) {
    if (isNumericInstruction(instruction)) {
      return parseNumber(arg);
    } else {
      return Object.fromEntries(
        Array.from(this.tokens.entries()).map(([k, v]) => [v, k])
      )[arg as string] ?? arg;
    }
  }
}

export default NospaceIR;
