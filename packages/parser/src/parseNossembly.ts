import { Instruction, Operation, IRArgs, TokenMap, isNumericInstruction, NumericOperation, isLabelledInstruction } from "./interfaces";
import { serializeNumber } from "./utils";

function hasPragma(line: string) {
  return /^#(if|define)/.test(line);
}

export function parseNossembly(nossembly: string): IRArgs {
  const operations: Operation[] = [];
  const tokens: Map<string, string> = new Map();
  const globals: Map<string, string> = new Map();

  nossembly
    .split('\n')
    .filter((line) => !!line.trim())
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

      if (isNumericInstruction(instruction)) {
        operations.push({
          instruction,
          argument: Number(arg),
        });
      } else if (isLabelledInstruction(instruction)) {
        if (!arg) {
          throw new Error('');
        }
        if (!tokens.has(arg)) {
          tokens.set(arg, serializeNumber(tokens.size));
        }
        operations.push({
          instruction,
          argument: arg,
        });
      } else {
        operations.push({
          instruction,
          argument: undefined,
        });
      }
    });

  return {
    operations,
    tokens,
  };
}
