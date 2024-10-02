import { Instruction, Operation, IRArgs, TokenMap, isNumericInstruction, isLabelledInstruction, ParseError } from "./interfaces";
import { irToNospace, irToWhitespace } from "./utils";

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

export function parseRaw(raw: string, ignoreNospace = false): IRArgs {
  const normalized = normalize(raw, ignoreNospace);

  const operations: Operation[] = [];
  const tokens: TokenMap = new Map();
  const errors: ParseError[] = [];
  let instruction: Instruction | undefined = undefined;
  let buf: string = '';
  let parsingArg = false;
  let startLn = 0;
  let ln = 0;
  let startCol = 0; 
  let col = 0;
  for (const char of normalized) {
    buf += char;
    if (char === 'n') {
      ln++;
      col = 1;
    } else {
      col++;
    }

    if (parsingArg) {
      if (char === 'n') {
        if (instruction) {
          const meta = {
            startLn,
            startCol,
            endCol: col,
            endLn: ln,
          };
          if (isNumericInstruction(instruction)) {
            operations.push({
              instruction,
              argument: parseNumber(buf),
              meta,
            });
          } else if (isLabelledInstruction(instruction)) {
            const token = Array.from(tokens.entries()).find(([_, v]) => v === buf)?.[0] ?? generateToken(tokens.size);
            if (!tokens.has(token)) {
              tokens.set(token, buf);
            }
            operations.push({
              instruction,
              argument: token,
              meta,
            });
          }

          startLn = ln;
          startCol = col;
        }
        buf = '';
        parsingArg = false;
      }
    } else {
      if (Object.values(Instruction).includes(buf as Instruction)) {
        instruction = buf as Instruction;
        buf = '';
        if (isNumericInstruction(instruction) || isLabelledInstruction(instruction)) {
          parsingArg = true;
        } else {
          operations.push({
            instruction,
            argument: undefined,
            meta: {
              startLn,
              startCol,
              endCol: col,
              endLn: ln,
            },
          });
          startLn = ln;
          startCol = col;
        }
      }

      if (buf.length > 4) {
        errors.push({
          type: 'unknown_instruction',
          message: `Unrecognized instruction "${buf}"`,
          meta: {
            startLn: startLn,
            startCol: startCol,
            endLn: ln,
            endCol: col,
          },
        });
      }
    }
  }

  if (!!buf) {
    errors.push({
      type: 'unknown_instruction',
      message: `Unrecognized instruction "${ignoreNospace ? irToWhitespace(buf) : irToNospace(buf)}"`,
      meta: {
        startLn: startLn,
        startCol: startCol,
        endLn: ln,
        endCol: col,
      },
    });
  }

  return {
    operations,
    tokens,
    parseErrors: errors,
  };
}
