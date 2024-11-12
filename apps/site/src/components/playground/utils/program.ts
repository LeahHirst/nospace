import { NospaceIR } from '@repo/parser';

export function getProgram(lang: string, code: string) {
  switch (lang.toLowerCase()) {
    case 'nospace':
      return NospaceIR.fromNospace(code);
    case 'whitespace':
      return NospaceIR.fromWhitespace(code);
    case 'nossembly':
      return NospaceIR.fromNossembly(code);
    default:
      throw new Error('Unrecognized language');
  }
}

export function serializeProgram(lang: string, prog: NospaceIR) {
  switch (lang.toLowerCase()) {
    case 'nospace':
      return prog.toNospace();
    case 'whitespace':
      return prog.toWhitespace();
    case 'nossembly':
      return prog.toNossembly();
    default:
      throw new Error('Unrecognized language');
  }
}
