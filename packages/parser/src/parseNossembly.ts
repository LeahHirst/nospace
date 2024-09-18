import { NumericParameterizedInstructions, ParameterizedInstructions } from "./const";
import { Instruction, Operation, ProgramArgs } from "./interfaces";

function hasPragma(line: string) {
  return /^#(if|define)/.test(line);
}

function serializeNumber(n: number) {
  return `s${n.toString(2).replace(/0/g, 's').replace(/1/g, 't')}n`;
}

export function parseNossembly(nossembly: string): ProgramArgs {
  const operations: Operation[] = [];
  const tokens: Map<string, string> = new Map();
  const globals: Map<string, string> = new Map();

  nossembly
    .split('\n')
    .forEach((line, lineNum) => {
      let parts = line.trim().replace(/# /g, '').split(' ');

      if (hasPragma(line)) {
        const [pragma, key, value, ...rest] = parts;

        if (!key || !value) {
          throw new Error(`Pragmas must specify both a key and value (L${lineNum})`);
        }

        switch (pragma) {
          case '#if': {
            if (globals.get(key) !== value) {
              return;
            }
            parts = rest;
          }
          case '#define': {
            if (rest.length > 0) {
              throw new Error(`Incorrect number of arguments for #define pragma on L${lineNum} (expected 2, got ${rest.length + 2})`);
            }

            globals.set(key, value);
            return;
          }
          default: throw new Error(`Unknown pragma "${pragma}" (L${lineNum})`);
        }
      }

      const [instructionName, arg, ...rest] = parts;
      const [_, instruction] = Object.entries(Instruction)
        .find(([name]) => name === instructionName) ?? [];

      if (!instruction) {
        throw new Error(`Unrecognized instruction "${instructionName}" (L${lineNum})`);
      }

      const expectedArgCount = ParameterizedInstructions.includes(instruction) ? 1 : 0;
      const receivedArgCount = rest.length + (arg ? 1 : 0);
      if (expectedArgCount !== receivedArgCount) {
        throw new Error(`Incorrect number of arguments for instruction ${instructionName} on L${lineNum} (expected ${expectedArgCount}, got ${receivedArgCount})`);
      }

      const isNumericArg = NumericParameterizedInstructions.includes(instruction);
      const normalizedArg = expectedArgCount === 0
        ? undefined
        : isNumericArg
          ? serializeNumber(Number(arg))
          : tokens.has(arg ?? '')
            ? tokens.get(arg ?? '')
            : serializeNumber(tokens.size)
      operations.push({
        instruction,
        argument: normalizedArg
      });
      if (!isNumericArg && arg && tokens.has(arg) && normalizedArg) {
        tokens.set(arg, normalizedArg);
      }
    });

  return {
    operations,
    tokens,
  }
}
