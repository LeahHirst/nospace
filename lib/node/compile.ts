import { ZWJ, ZWNJ, ZWSP } from "./typecheck/constants";

export const decompile = (whitespace: string) =>
  whitespace.replaceAll(' ', ZWSP).replaceAll('\t', ZWJ).replaceAll('\n', ZWNJ);

export const compile = (nospace: string) =>
  nospace.replaceAll(ZWSP, ' ').replaceAll(ZWJ, '\t').replaceAll(ZWNJ, '\n').replaceAll(/\uFEFF.*?\u200D/g, '');
