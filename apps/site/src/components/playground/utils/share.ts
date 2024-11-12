import lzstring from 'lz-string';

export function generateShareHashParameter(code: string, input?: string) {
  return `#code/${[code, input]
    .filter(Boolean)
    .map((x) => lzstring.compressToEncodedURIComponent(x!))
    .join('/')}`;
}

export function getSharedCode() {
  if (typeof window !== 'undefined' && location.hash.startsWith('#code')) {
    const [code, input] = location.hash
      .replace('#code/', '')
      .trim()
      .split('/')
      .map((x) => lzstring.decompressFromEncodedURIComponent(x));
    return {
      code,
      input,
    };
  }

  return {
    code: '',
    input: '',
  };
}
