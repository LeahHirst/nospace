import { NospaceIR } from '@repo/parser';
import { Typechecker } from '../Typecheck';

function result(nsa: string) {
  const ir = NospaceIR.fromNossembly(nsa);
  const tc = new Typechecker(ir);
  const [success] = tc.typecheck();
  return success;
}

describe('Typechecker', () => {
  describe('No-op program', () => {
    it('passes', () => {
      expect(result('')).toBeTruthy();
    });
  });

  describe('Primitives', () => {
    it('can pop Any value', () => {
      expect(
        result(`
        Push 1
        Pop
      `),
      ).toBeTruthy();
    });

    it('can pop typed value', () => {
      expect(
        result(`
        Push 1
        Cast Char
        Pop
      `),
      ).toBeTruthy();
    });

    it('cannot underflow stack', () => {
      expect(
        result(`
        Pop
      `),
      ).toBeFalsy();
    });
  });

  describe('Casting and assertions', () => {
    describe('with Any base value', () => {
      it('can assert Any value', () => {
        expect(
          result(`
          Push 1
          Assert Any
        `),
        ).toBeTruthy();
      });

      it('can assert typed value', () => {
        expect(
          result(`
          Push 1
          Assert Char
        `),
        ).toBeTruthy();
      });
    });

    describe('with typed base value', () => {
      it('can assert Any value', () => {
        expect(
          result(`
          Push 1
          Cast Char
          Assert Any
        `),
        ).toBeTruthy();
      });

      it('can assert typed value', () => {
        expect(
          result(`
          Push 1
          Cast Char
          Assert Char
        `),
        ).toBeTruthy();
      });

      it('cannot assert an incompatible types', () => {
        expect(
          result(`
          Push 1
          Cast Char
          Assert Int
        `),
        ).toBeFalsy();
      });
    });

    describe('with multiple stack items', () => {
      it('valid chained assertions pass', () => {
        expect(
          result(`
          Push 1
          Cast CustomA
          Push 2
          Cast CustomB
          Push 3
          Cast CustomC
  
          Assert CustomC
          Pop
          Assert CustomB
          Pop
          Assert CustomA
        `),
        ).toBeTruthy();
      });

      it('incorrect assertions fail', () => {
        expect(
          result(`
          Push 1
          Cast CustomA
          Push 2
          Cast CustomB
          Push 3
          Cast CustomC

          Assert CustomC
          Pop
          Assert CustomA
        `),
        ).toBeFalsy();
      });
    });
  });

  describe('Labels', () => {
    it('types persist during waterfalling', () => {
      expect(
        result(`
        Push 1
        Cast Int
        Label A
          Assert Char
      `),
      ).toBeFalsy();
    });

    it('Jump with empty branch works', () => {
      expect(
        result(`
        Jump A

        Label A
          Push 1
          Assert Int
      `),
      ).toBeTruthy();
    });

    it('types persist after Jump', () => {
      expect(
        result(
          `
        Push 1
        Cast Int
        Jump A

        Label A
          Assert Char
      `,
        ),
      ).toBeFalsy();
    });

    it('types persist after JumpZero', () => {
      expect(
        result(`
        Push 1
        Cast Int
        JumpZero A

        Label A
          Assert Char
      `),
      ).toBeFalsy();
    });

    it('types persist after JumpNegative', () => {
      expect(
        result(`
        Push 1
        Cast Int
        JumpNegative A

        Label A
          Assert Char
      `),
      ).toBeFalsy();
    });
  });

  describe('Branching', () => {
    describe('with multiple converging branches', () => {
      describe('if one branch condition matches', () => {
        it('passes', () => {
          expect(
            result(`
            Push 1
            Push 1
            JumpZero A
            Push 1
            Cast CustomType
            Jump B

            Label A
              Cast Int
              Jump C

            Label B
              Cast Char
              Jump C

            Label C
              Assert Char
              Pop
              Assert CustomType
          `),
          ).toBeTruthy();
        });
      });

      describe('if no branch condition matches', () => {
        it('fails', () => {
          expect(
            result(`
            Push 1
            Push 1
            JumpZero B

            Label A
              Cast CustomA
              Jump C

            Label B
              Cast CustomB
              Jump C

            Label C
              Assert CustomC
          `),
          ).toBeFalsy();
        });
      });
    });

    describe('with loops', () => {
      describe('loop with consistent type', () => {
        it('passes', () => {
          expect(
            result(`
            Push 1
            Cast Int
            Label A
              Assert Int
              JumpNegative A
          `),
          ).toBeTruthy();
        });
      });

      describe('loop with recursive type', () => {
        it('passes when asserting recursive type', () => {
          expect(
            result(`
            Push 1
            Cast Int
            Label A
              Push 1
              Cast CustomA
              Push 1
              Cast Int
              JumpZero A
            Label B
              Assert CustomA
              Pop
              Assert CustomA
          `),
          ).toBeTruthy();
        });

        it('passes when asserting underlying type', () => {
          expect(
            result(`
            Push 1
            Cast Int
            Label A
              Push 1
              Cast CustomA
              Push 1
              Cast Int
              JumpZero A
            Label B
              Assert CustomA
              Pop
              Assert Int
          `),
          ).toBeTruthy();
        });

        it('asserting both union types fail', () => {
          expect(
            result(`
            Push 1
            Cast Int
            Label A
              Push 1
              Cast CustomA
              Push 1
              Cast Int
              JumpZero A
            Label B
              Assert CustomA
              Pop
              Assert CustomA
              Assert Int
          `),
          ).toBeFalsy();
        });
      });
    });
  });

  describe('Subroutines', () => {
    it('subroutines apply types correctly outside of call', () => {
      expect(
        result(`
        Call A
        Jump B

        Label A
          Push 1
          Cast CustomA
          Return

        Label B
          Assert CustomA
      `),
      ).toBeTruthy();
    });

    it('nested subroutines apply types correctly outside of call', () => {
      expect(
        result(`
        Call A
        Jump C

        Label A
          Push 1
          Cast CustomA

          Call B
          Assert CustomB

          Return

        Label B
          Cast CustomB

        Label C
          Assert CustomB
      `),
      ).toBeTruthy();
    });

    describe('calls into subroutines with union types', () => {
      it('passes when asserting union type', () => {
        const test = (type: string) => `
          Push 1
          JumpZero A
          Jump B

          Label A
            Push 1
            Cast CustomA
            Jump C

          Label B
            Push 1
            Cast CustomB
            Jump C

          Label C
            Call D

          Label D
            Assert ${type}
        `;
        expect(result(test('CustomA'))).toBeTruthy();
        expect(result(test('CustomB'))).toBeTruthy();
      });
    });
  });
});
