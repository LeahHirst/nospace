import { Instruction, Operation, ProgramArgs, TokenMap } from "./interfaces";
import { parseNossembly } from "./parseNossembly";
import { parseRaw } from "./parseRaw";

export class Program {
  private operations: Operation[];

  private tokens: TokenMap;

  private constructor({ operations, tokens }: ProgramArgs) {
    this.operations = operations;
    this.tokens = tokens;
  }

  toNossembly() {
    const instructionNames = Object.fromEntries(
      Object.entries(Instruction).map(([k, v]) => [v, k]),
    );

    let indent = false;
    let out = '';

    for (const op of this.operations) {
      const name = instructionNames[op.instruction];
      const normalizedArg = op.argument
    }
  }

  toWhitespace() {
    return this.operations
      .filter(x => [
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

  static fromNossembly(nossembly: string): Program {
    const args = parseNossembly(nossembly);
    return new Program(args);
  }

  static fromWhitespace(whitespace: string): Program {
    const args = parseRaw(whitespace, true);
    return new Program(args);
  }

  static fromNospace(nospace: string): Program {
    const args = parseRaw(nospace, false);
    return new Program(args);
  }
}

export default Program;
