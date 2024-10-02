export function parseNumber(chars: string) {
  const unsigned = chars[0] === "s";
  const binary = chars
    .slice(1)
    .replace(/n/g, "")
    .replace(/s/g, "0")
    .replace(/t/g, "1");

  return parseInt(binary, 2) * (unsigned ? 1 : -1);
}
