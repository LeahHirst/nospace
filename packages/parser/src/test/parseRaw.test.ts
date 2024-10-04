import { Instruction, IRArgs } from '../interfaces';
import { parseRaw } from '../parseRaw';

const allInstructions =
  'tntstntttnsstnstssststnsnssntsnnstsststnstnststntssstssttssntstststtnssststnnstststnnsnststnntsststnnttststnntnnnnttsttt';
const typeInstructions = 'xsststnxtststn';

const expectedAllInstructions = [
  {
    instruction: Instruction.ReadChar,
  },
  {
    instruction: Instruction.ReadInt,
  },
  {
    instruction: Instruction.WriteChar,
  },
  {
    instruction: Instruction.WriteInt,
  },
  {
    instruction: Instruction.Push,
    argument: 5,
  },
  {
    instruction: Instruction.Duplicate,
  },
  {
    instruction: Instruction.Swap,
  },
  {
    instruction: Instruction.Pop,
  },
  {
    instruction: Instruction.Copy,
    argument: 5,
  },
  {
    instruction: Instruction.Slide,
    argument: 5,
  },
  {
    instruction: Instruction.Add,
  },
  {
    instruction: Instruction.Subtract,
  },
  {
    instruction: Instruction.Multiply,
  },
  {
    instruction: Instruction.Divide,
  },
  {
    instruction: Instruction.Mod,
  },
  {
    instruction: Instruction.Label,
    argument: 'A',
  },
  {
    instruction: Instruction.Call,
    argument: 'A',
  },
  {
    instruction: Instruction.Jump,
    argument: 'A',
  },
  {
    instruction: Instruction.JumpZero,
    argument: 'A',
  },
  {
    instruction: Instruction.JumpNegative,
    argument: 'A',
  },
  {
    instruction: Instruction.Return,
  },
  {
    instruction: Instruction.End,
  },
  {
    instruction: Instruction.Store,
  },
  {
    instruction: Instruction.Retrieve,
  },
].map((x) => ({ ...x, meta: expect.any(Object) }));

const expectedTypeInstructions = [
  {
    instruction: Instruction.Cast,
    argument: 'TypeA',
  },
  {
    instruction: Instruction.Assert,
    argument: 'TypeA',
  },
].map((x) => ({ ...x, meta: expect.any(Object) }));

const labelInstructions = 'nssstnnssssnnssstsnnsssttn';

function toWhitespace(readable: string) {
  return readable
    .split('')
    .map((x) => ({ s: ' ', t: '\t', n: '\n' })[x])
    .join('');
}

function toNospace(readable: string) {
  return readable
    .split('')
    .map((x) => ({ s: '\u200B', t: '\u200C', n: '\u200D', x: '\u2060' })[x])
    .join('');
}

describe('parseRaw', () => {
  describe('when parsing whitespace', () => {
    it('parses instructions correctly', () => {
      const result = parseRaw(toWhitespace(allInstructions), true);
      expect(result.operations).toEqual(
        expectedAllInstructions.map((x) => expect.objectContaining(x)),
      );
    });

    it('generates tokens', () => {
      const result = parseRaw(toWhitespace(labelInstructions), true);
      expect(Array.from(result.tokens.entries())).toEqual([
        ['A', 'stn'],
        ['B', 'ssn'],
        ['C', 'stsn'],
        ['D', 'sttn'],
      ]);
    });

    it('ignores nospace characters', () => {
      const result = parseRaw(
        toWhitespace(allInstructions)
          .split('')
          .map((x) => x + '\u200B')
          .join(''),
        true,
      );
      expect(result.operations).toEqual(expectedAllInstructions);
    });
  });

  describe('when parsing nospace', () => {
    it('parses whitespace instructions correctly', () => {
      const result = parseRaw(toNospace(allInstructions));
      expect(result.operations).toEqual(expectedAllInstructions);
    });

    it('parses type instructions correctly', () => {
      const result = parseRaw(toNospace(typeInstructions));
      expect(result.operations).toEqual(expectedTypeInstructions);
    });

    it('generates tokens for labels', () => {
      const result = parseRaw(toNospace(labelInstructions));
      expect(Array.from(result.tokens.entries())).toEqual([
        ['A', 'stn'],
        ['B', 'ssn'],
        ['C', 'stsn'],
        ['D', 'sttn'],
      ]);
    });
  });
});
