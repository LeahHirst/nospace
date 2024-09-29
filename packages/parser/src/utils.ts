
export function serializeNumber(n: number) {
  return `s${n.toString(2).replace(/0/g, 's').replace(/1/g, 't')}n`;
}

export function parseNumber(serialized: string) {
  return parseInt(serialized.slice(1, -1).replace(/s/g, '0').replace(/t/g, '1'), 2) * (serialized[0] === 's' ? 1 : -1);
}
