import { NumericParameterizedInstructions, ParameterizedInstructions } from "./const";
import { Instruction, Operation, ProgramArgs, TokenMap } from "./interfaces";

function normalize(raw: string, ignoreNospace = false): string {
  const normalized = raw
    .replace(/ /g, 's')
    .replace(/\t/g, 't')
    .replace(/\n/g, 'n');

  if (ignoreNospace) {
    return normalized.replace(/[^stn]/g, '') as string;
  }

  return normalized
    .replace(/\u200B/g, 's')
    .replace(/\u200C/g, 't')
    .replace(/\u200D/g, 'n')
    .replace(/\u2060/g, 'x')
    .replace(/[^stnx]/g, '') as string;
}

function parseNumber(chars: string) {
  const unsigned = chars[0] === 's';
  const binary = chars
    .slice(1)
    .replace(/n/g, '')
    .replace(/s/g, '0')
    .replace(/t/g, '1');

  return parseInt(binary, 2) * (unsigned ? 1 : -1);
}

// Generates an alpha token from a number (A-Z, AA-ZZ, etc.)
function generateToken(n: number) {
  return n
    .toString(26)
    .split('')
    .map((x) => ({
      0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E',
      5: 'F', 6: 'G', 7: 'H', 8: 'I', 9: 'J',
      a: 'K', b: 'L', c: 'M', d: 'N', e: 'O',
      f: 'P', g: 'Q', h: 'R', i: 'S', j: 'T',
      k: 'U', l: 'V', m: 'W', n: 'X', o: 'Y',
      p: 'Z',
    }[x]))
    .join('');
}

export function parseRaw(raw: string, ignoreNospace = false): ProgramArgs {
  const normalized = normalize(raw, ignoreNospace);

  const operations: Operation[] = [];
  const tokens: TokenMap = new Map();
  let instruction: Instruction | undefined = undefined;
  let buf: string = '';
  let parsingArg = false;
  for (const char of normalized) {
    buf += char;

    if (parsingArg) {
      if (char === 'n') {
        if (instruction) {
          const tokenizedArg = !NumericParameterizedInstructions.includes(instruction);
          operations.push({ instruction, argument: tokenizedArg ? (tokens.get(buf) ?? buf) : buf });

          if (!NumericParameterizedInstructions.includes(instruction)) {
            tokens.set(generateToken(tokens.size), buf);
          }
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
      
      if (buf.length > 4) {
        throw new Error(`Unrecognized instruction: ${buf}`);
      }
    }
  }

  return {
    operations,
    tokens,
  };
}
