
export function serializeNumber(n: number) {
  return `s${n.toString(2).replace(/0/g, 's').replace(/1/g, 't')}n`;
}

export function parseNumber(serialized: string) {
  return parseInt(serialized.slice(1, -1).replace(/s/g, '0').replace(/t/g, '1'), 2) * (serialized[0] === 's' ? 1 : -1);
}

export function irToNospace(ir: string) {
  return ir
    .replace(/s/g, '\u200B')
    .replace(/t/g, '\u200C')
    .replace(/n/g, '\u200D')
    .replace(/x/g, '\u2060')
}

export function irToWhitespace(ir: string) {
  return ir
    .replace(/s/g, ' ')
    .replace(/t/g, '\t')
    .replace(/n/g, '\n')
}
