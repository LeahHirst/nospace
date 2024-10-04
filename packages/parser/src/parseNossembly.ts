import {
  Instruction,
  Operation,
  IRArgs,
  isNumericInstruction,
  isLabelledInstruction,
  ParseError,
  Type,
  isTypeInstruction,
} from './interfaces';
import { serializeNumber } from './utils';

function hasPragma(line: string) {
  return /^#(if|define)/.test(line);
}

export function parseNossembly(nossembly: string): IRArgs {
  const operations: Operation[] = [];
  const tokens: Map<string, string> = new Map();
  const types: Record<string, string> = structuredClone(Type);
  const errors: ParseError[] = [];
  const globals: Map<string, string> = new Map();

  nossembly.split('\n').forEach((line, lineNum) => {
    if (!line.trim() || line.trim().startsWith('# ')) {
      return;
    }

    let parts = line.trim().replace(/# /g, '').split(' ');

    if (hasPragma(line)) {
      const [pragma, key, value, ...rest] = parts;

      if (!key || !value) {
        errors.push({
          type: 'pragma',
          message: 'Pragmas must specify both a key and value',
          meta: {
            startLn: lineNum,
            startCol: line.indexOf(pragma ?? ''),
            endCol: line.length,
            endLn: lineNum,
            instructionName: pragma ?? '',
          },
        });
        return;
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
            errors.push({
              type: 'pragma',
              message: 'Incorrect number of arguments for #define pragma',
              meta: {
                startLn: lineNum,
                startCol: line.indexOf(pragma ?? ''),
                endCol: line.length,
                endLn: lineNum,
                instructionName: '#define',
              },
            });
            return;
          }

          globals.set(key, value);
          return;
        }
        default: {
          errors.push({
            type: 'pragma',
            message: `Unknown pragma "${pragma}"`,
            meta: {
              startLn: lineNum,
              startCol: line.indexOf(pragma ?? ''),
              endCol: line.length,
              endLn: lineNum,
              instructionName: pragma ?? '',
            },
          });
          return;
        }
      }
    }

    const [instructionName, arg] = parts;
    const [_, instruction] =
      Object.entries(Instruction).find(([name]) => name === instructionName) ??
      [];

    if (!instruction) {
      errors.push({
        type: 'unknown_instruction',
        message: `Unrecognized instruction "${instructionName}"`,
        meta: {
          startLn: lineNum,
          startCol: line.indexOf(instructionName ?? ''),
          endCol: line.length,
          endLn: lineNum,
          instructionName: instructionName ?? '',
        },
      });
      return;
    }

    const meta = {
      startLn: lineNum,
      startCol: line.indexOf(instructionName ?? ''),
      endLn: lineNum,
      endCol: line.length,
      instructionName: instructionName ?? '',
    };

    if (isTypeInstruction(instruction)) {
      if (!arg) {
        errors.push({
          type: 'argument',
          message: `You must specify a type`,
          meta: {
            startLn: lineNum,
            startCol: line.indexOf(instructionName ?? ''),
            endCol: line.length,
            endLn: lineNum,
            instructionName: instructionName ?? '',
          },
        });
        return;
      }

      types[arg] ??= serializeNumber(10 + Object.keys(types).length);
      operations.push({
        instruction,
        argument: types[arg],
        meta: {
          ...meta,
          typeName: arg,
        },
      });
    } else if (isNumericInstruction(instruction)) {
      if (!arg) {
        errors.push({
          type: 'argument',
          message: `An argument must be provided to the ${instructionName} instruction`,
          meta: {
            startLn: lineNum,
            startCol: line.indexOf(instructionName ?? ''),
            endCol: line.length,
            endLn: lineNum,
            instructionName: instructionName ?? '',
          },
        });
        return;
      }
      operations.push({
        instruction,
        argument: Number(arg),
        meta,
      });
    } else if (isLabelledInstruction(instruction)) {
      if (!arg) {
        errors.push({
          type: 'argument',
          message: `An argument must be provided to the ${instructionName} instruction`,
          meta: {
            startLn: lineNum,
            startCol: line.indexOf(instructionName ?? ''),
            endCol: line.length,
            endLn: lineNum,
            instructionName: instructionName ?? '',
          },
        });
        return;
      }
      if (!tokens.has(arg)) {
        tokens.set(arg, serializeNumber(tokens.size));
      }
      operations.push({
        instruction,
        argument: arg,
        meta,
      });
    } else {
      operations.push({
        instruction,
        meta,
      });
    }
  });

  return {
    operations,
    tokens,
    parseErrors: errors,
  };
}
