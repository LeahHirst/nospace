import { Instruction } from '@repo/parser';
import { registerLanguage } from './common';
import type { Monaco } from './types';

export function registerNossembly(monaco: Monaco) {
  const keywords = Object.keys(Instruction);
  registerLanguage(monaco, 'nossembly', keywords, {
    root: [
      [
        /[a-z_$][\w$]*/,
        {
          cases: {
            '@keywords': 'keyword',
            '@default': 'identifier',
          },
        },
      ],
      [/[A-Z][\w\$]*/, 'type.identifier'],
      [/#/, 'comment'],
    ],
  });
}
