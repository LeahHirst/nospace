import { ZWJ, ZWNBSP, ZWNJ, ZWSP } from "../typecheck/constants";
import { Type } from "../typecheck/interfaces";

const characterMap = new Map([
  ['s', ZWSP],
  ['t', ZWNJ],
  ['n', ZWJ],
  ['x', ZWNBSP],
]);

const keywords = {
  readchar: 'tnts',
  readint: 'tntt',
  printchar: 'tnss',
  printint: 'tnst',
  push: 'ss',
  duplicate: 'sns',
  swap: 'snt',
  pop: 'snn',
  copy: 'sts',
  slice: 'stn',
  add: 'tsss',
  subtract: 'tsst',
  multiply: 'tssn',
  divide: 'tsts',
  mod: 'tstt',
  label: 'nss',
  jumpnegative: 'ntt',
  jumpzero: 'nts',
  jump: 'nsn',
  call: 'nst',
  return: 'ntn',
  end: 'nnn',
  store: 'tts',
  retrieve: 'ttt',
  cast: 'xs',
  assert: 'xt',
};

function encodeNumber(n: number) {
  return [
    n < 0 ? 't' : 's',
    Math.abs(Math.floor(n)).toString(2).split('').map(d => d === '0' ? 's' : 't').join(''),
    'n',
  ].join('');
}

function encodeChar(char: string) {
  return encodeNumber(char.charCodeAt(0));
}

function isLabel(value: string) {
  return Number.isNaN(parseInt(value));
}

function encode(value: string) {
  return isLabel(value) ? encodeChar(value) : encodeNumber(parseInt(value));
}

export class Program {
  private tokens: Map<string, number> = new Map();

  private globals: Map<string, string> = new Map();

  public output: string = '';

  constructor(public code: string) {
    for (const line of this.code.split('\n')) {
      this.processLine(line);
    }
  }

  processLine(line: string) {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (trimmed.startsWith('#')) return;

    let interpolated = trimmed;
    if (interpolated.startsWith('#if')) {
      const [_, key, value, ...rest] = interpolated.split(' ');
      if (this.globals.get(key) !== value) {
        return;
      }

      interpolated = rest.join(' ');
    }
    for (const [key, value] of this.globals.entries()) {
      interpolated = interpolated.replace(key, value);
    }

    const [keyword, ...params] = interpolated.split(' ');
    const param = params.join(' ').trim();

    if (keyword === '#define') {
      this.globals.set(params[0], params[1]);
      return;
    }

    if (['cast', 'assert'].includes(keyword.toLowerCase()) && Object.keys(Type).includes(param)) {
      this.output += keywords[keyword.toLowerCase() as keyof typeof keywords] + Type[param as keyof typeof Type] + '\n';
      return;
    }
    
    if (param && isLabel(param) && !this.tokens.has(param)) {
      this.tokens.set(param, this.tokens.size + 5);
    }

    const tokenizedParam = this.tokens.get(param) || param;

    if (keyword.toLowerCase() in keywords) {
      this.output += keywords[keyword.toLowerCase() as keyof typeof keywords];
      if (tokenizedParam) {
        this.output += encode(tokenizedParam.toString());
      }
      this.output += '\n';
    }
  }

  public serialize() {
    let output = this.output.replace(/\n/g, '');;
    for (const [key, value] of characterMap.entries()) {
      output = output.replace(new RegExp(key, 'g'), value);
    }
    return output;
  }
}
