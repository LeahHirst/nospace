import { NospaceIR } from '@repo/parser';
import lzstring from 'lz-string';
import { serializeProgram } from './program';

export function generateShareHashParameter(code: string, input?: string) {
  return `#code/${[code, input]
    .filter(Boolean)
    .map((x) => lzstring.compressToEncodedURIComponent(x!))
    .join('/')}`;
}

export function getSharedCode(lang: string = 'nospace') {
  if (typeof window !== 'undefined' && location.hash.startsWith('#code')) {
    const [nossembly, input] = location.hash
      .replace('#code/', '')
      .trim()
      .split('/')
      .map((x) => lzstring.decompressFromEncodedURIComponent(x));

    const ir = NospaceIR.fromNossembly(nossembly);

    return {
      code: serializeProgram(lang, ir),
      input,
    };
  }

  return {
    code: '',
    input: '',
  };
}
