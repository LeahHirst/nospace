import styled from '@emotion/styled';
import { NospaceIR } from '@repo/parser';
import { useMemo } from 'react';

const CodeBlock = styled.code`
  white-space: pre-wrap;
`;

export type SyntaxTableProps = {
  command: string;
  inter?: string;
};

export default function SyntaxTable({ command, inter }: SyntaxTableProps) {
  const [ns, ws] = useMemo(() => {
    const ir = inter ? undefined : NospaceIR.fromNossembly(command);
    const nospace = inter
      ? inter
          .replace(/s/g, '\u200B')
          .replace(/t/g, '\u200C')
          .replace(/n/g, '\u200D')
          .replace(/x/g, '\u2060')
      : ir!.toNospace();
    const whitespace = inter
      ? inter.replace(/s/g, ' ').replace(/t/g, '\t').replace(/n/g, '\n')
      : ir!.toWhitespace();
    return [nospace, inter?.includes('x') ? undefined : whitespace];
  }, [command]);

  return (
    <table>
      <tr>
        <th></th>
        <th>Command</th>
        <th>Unobsfucated</th>
      </tr>
      <tr>
        <td>Nospace</td>
        <td>
          <code>{ns}</code>
        </td>
        <td>
          {ns.split('').map((x, i) => (
            <>
              {i !== 0 && ', '}
              <code key={i}>
                {x
                  .replace(/\u200B/g, 'ZWSP')
                  .replace(/\u200C/g, 'ZWNJ')
                  .replace(/\u200D/g, 'ZWJ')
                  .replace(/\u2060/g, 'WJ')}
              </code>
            </>
          ))}
        </td>
      </tr>
      <tr>
        <td>Whitespace</td>
        <td>{ws ? <CodeBlock>{ws + '\n'}</CodeBlock> : '-'}</td>
        <td>
          {ws
            ? ns.split('').map((x, i) => (
                <>
                  {i !== 0 && ', '}
                  {x
                    .replace(/\u200B/g, 'Space')
                    .replace(/\u200C/g, 'Tab')
                    .replace(/\u200D/g, 'Newline')}
                </>
              ))
            : '-'}
        </td>
      </tr>
      <tr>
        <td>Nossembly</td>
        <td>
          <code>{command}</code>
        </td>
        <td>-</td>
      </tr>
    </table>
  );
}
