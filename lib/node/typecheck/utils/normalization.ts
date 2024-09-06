export const normalize = (whitespace: string) => whitespace
    .replace(/[\u200B ]/g, 's')
    .replace(/[\u200C\t]/g, 't')
    .replace(/[\u200D\n]/g, 'n')
    .replace(/\uFEFF/g, 'x')
    .replace(/[^stnx]/g, '');

export const parseNumber = (normalized: string) => {
  const unsigned = normalized[0] === 's';
  const binary = normalized
    .slice(1)
    .replace(/n/g, '')
    .replace(/s/g, '0')
    .replace(/t/g, '1');

  return parseInt(binary, 2) * (unsigned ? 1 : -1);
};
