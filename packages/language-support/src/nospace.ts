import { Instruction } from '@repo/parser';
import { registerLanguage } from './common';
import type { Monaco } from './types';

export function registerNospace(monaco: Monaco) {
  const keywords = Object.values(Instruction).map((x) =>
    x
      .replace(/s/g, '\u200B')
      .replace(/t/g, '\u200C')
      .replace(/n/g, '\u200D')
      .replace(/x/g, '\u2060'),
  );
  registerLanguage(monaco, 'nospace', keywords, {
    root: [
      [
        /@?[a-zA-Z][\w$]*/,
        {
          cases: {
            '@keywords': 'keyword',
            '@default': 'variable',
          },
        },
      ],
      [/[\u200B\u200C]*?\u200D/, 'string'],
      [/# /, 'comment'],
    ],
  });
}
