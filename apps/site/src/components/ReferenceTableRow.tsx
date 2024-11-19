import styled from '@emotion/styled';
import { NospaceIR } from '@repo/parser';
import { useMemo } from 'react';

const CodeBlock = styled.code`
  white-space: pre-wrap;
`;

export type ReferenceTableRowProps = {
  command: string;
  link: string;
};

export default function ReferenceTableRow({
  command,
  link,
}: ReferenceTableRowProps) {
  const [ns, ws] = useMemo(() => {
    const ir = NospaceIR.fromNossembly(command);
    return [ir.toNospace(), ir.toWhitespace()];
  }, [command]);

  return (
    <tr>
      <td>
        <a href={link}>{command}</a>
      </td>
      <td>
        <code>{ns}</code>
      </td>
      <td>
        <CodeBlock>{ws}</CodeBlock>
      </td>
      <td>
        <code>{command}</code>
      </td>
    </tr>
  );
}
