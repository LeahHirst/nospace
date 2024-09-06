import { Instruction, NumericParameterizedInstructions, Operation, ParameterizedInstructions } from "./interfaces";
import { normalize, parseNumber } from "./utils/normalization";

export function parse(whitespace: string): Operation[] {
  const normalized = normalize(whitespace);

  const operations: Operation[] = [];
  let instruction: Instruction | undefined = undefined;
  let buf = '';
  let parsingArg = false;
  for (const char of normalized) {
    buf += char;

    if (parsingArg) {
      if (char === 'n') {
        if (instruction) {
          const parsedArgument = NumericParameterizedInstructions.includes(instruction) ? parseNumber(buf) : buf;
          operations.push({ instruction, argument: parsedArgument });
        }
        buf = '';
        parsingArg = false;
      }
    } else {
      if (Object.values(Instruction).includes(buf as Instruction)) {
        instruction = buf as Instruction;
        buf = '';
        if (ParameterizedInstructions.includes(instruction)) {
          parsingArg = true;
        } else {
          operations.push({ instruction });
        }
      }
    }
  }

  return operations;
}
