import { Program } from "../nossembly/nossembly";
import { extractBranches } from "../typecheck/branch";
import { parse } from "../typecheck/parse";
import { Typecheck } from "../typecheck/typecheck";
import { diagram } from "../typecheck/utils/diagram";

function result(assembly: string, printDiagram?: boolean) {
  const prog = new Program(assembly);
  const ops = parse(prog.serialize());
  const branches = extractBranches(ops);
  const tc = new Typecheck(branches);
  if (printDiagram) {
    console.log('Before:');
    console.log(diagram(tc.graphRoot));
  }
  const success = tc.run();
  if (printDiagram) {
    console.log('After:');
    console.log(diagram(tc.graphRoot));
  }
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
      expect(result(`
        Push 1
        Pop
      `)).toBeTruthy();
    });

    it('can pop typed value', () => {
      expect(result(`
        Push 1
        Cast Char
        Pop
      `)).toBeTruthy();
    });

    it('cannot underflow stack', () => {
      expect(result(`
        Pop
      `)).toBeFalsy();
    });
  });

  describe('Casting and assertions', () => {
    describe('with Any base value', () => {
      it('can assert Any value', () => {
        expect(result(`
          Push 1
          Assert Any
        `)).toBeTruthy();
      });
  
      it('can assert typed value', () => {
        expect(result(`
          Push 1
          Assert Char
        `)).toBeTruthy();
      });
    });

    describe('with typed base value', () => {
      it('can assert Any value', () => {
        expect(result(`
          Push 1
          Cast Char
          Assert Any
        `)).toBeTruthy();
      });

      it('can assert typed value', () => {
        expect(result(`
          Push 1
          Cast Char
          Assert Char
        `)).toBeTruthy();
      });

      it('cannot assert an incompatible types', () => {
        expect(result(`
          Push 1
          Cast Char
          Assert Int
        `)).toBeFalsy();
      });
    });

    describe('with multiple stack items', () => {
      it('valid chained assertions pass', () => {
        expect(result(`
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
        `)).toBeTruthy();
      });

      it('incorrect assertions fail', () => {
        expect(result(`
          Push 1
          Cast CustomA
          Push 2
          Cast CustomB
          Push 3
          Cast CustomC

          Assert CustomC
          Pop
          Assert CustomA
        `)).toBeFalsy();
      })
    });
  });

  describe('Labels', () => {
    it('types persist during waterfalling', () => {
      expect(result(`
        Push 1
        Cast Int
        Label A
          Assert Char
      `)).toBeFalsy();
    });

    it('types persist after Jump', () => {
      expect(result(`
        Push 1
        Cast Int
        Jump A

        Label A
          Assert Char
      `)).toBeFalsy();
    });

    it('types persist after JumpZero', () => {
      expect(result(`
        Push 1
        Cast Int
        JumpZero A

        Label A
          Assert Char
      `)).toBeFalsy();
    });

    it('types persist after JumpNegative', () => {
      expect(result(`
        Push 1
        Cast Int
        JumpNegative A

        Label A
          Assert Char
      `)).toBeFalsy();
    });
  });

  describe('Branching', () => {
    describe('with multiple converging branches', () => {
      describe('if one branch condition matches', () => {
        it('passes', () => {
          expect(result(`
            Push 1
            Push 1
            JumpZero A
            Jump B

            Label A
              Cast Int
              Jump C

            Label B
              Cast Char
              Jump C

            Label C
              Assert Int
          `)).toBeTruthy();
        });
      });

      describe('if no branch condition matches', () => {
        it('fails', () => {
          expect(result(`
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
          `)).toBeFalsy();
        });
      });
    });

    describe('with loops', () => {
      describe('loop with consistent type', () => {
        it('passes', () => {
          expect(result(`
            Push 1
            Cast Int
            Label A
              Assert Int
              JumpNegative A
          `)).toBeTruthy();
        });
      });

      describe('loop with recursive type', () => {
        it('passes when asserting recursive type', () => {
          expect(result(`
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
          `)).toBeTruthy();
        });

        it('passes when asserting underlying type', () => {
          expect(result(`
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
          `)).toBeTruthy();
        });

        it('asserting both union types fail', () => {
          expect(result(`
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
          `)).toBeFalsy();
        });
      });
    });
  });

  // describe('Subroutines', () => {
  //   it('subroutines apply types correctly', () => {
  //     expect(result(`
  //       Call A
  //       Jump B

  //       Label A
  //         Push 1
  //         Cast CustomA
  //         Return

  //       Label B
  //         Assert CustomA
  //     `, true)).toBeTruthy();
  //   });
  // });
});
