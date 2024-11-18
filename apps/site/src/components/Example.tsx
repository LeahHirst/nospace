import React from 'react';
import styled from '@emotion/styled';
import { NospaceIR } from '@repo/parser';
import { serializeProgram } from './playground/utils/program';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: var(--ns-examples-bg);
  color: var(--ns-examples-fg);
  margin: 20px 0;
`;

const LanguageSwitcher = styled.div`
  display: flex;
  background-color: var(--ns-examples-toolbar-bg);
  padding: 0 10px;
  margin-top: 0 !important;
`;

const LanguageButton = styled.button<{ selected: boolean }>`
  background-color: unset;
  color: ${({ selected }) => (selected ? 'var(--ns-examples-accent)' : 'var(--ns-examples-fg)')};
  border: none;
  border-bottom: solid 2px ${({ selected }) => (selected ? 'var(--ns-examples-accent)' : 'transparent')};
  cursor: pointer;
  margin-top: 0 !important;
  margin-right: 10px;
  padding: 10px;
  font-weight: 500;
`;

const Code = styled.pre`
  border: none !important;
  padding: 10px;
  margin-top: 0 !important;
  white-space: pre-wrap;
`;

const Error = styled.pre`
  width: 100%;
  background-color: var(--ns-examples-error-bg);
  border: none !important;
  border-left: solid 2px var(--ns-examples-error-border) !important;
  padding: 10px;
  margin-bottom: 8px;
  margin-top: 0 !important;
  text-wrap: auto;
`;

export type ExampleProps = {
  example: string;
  languages?: string[];
  error?: string;
  raw?: string;
};

export default function Example({ example, languages = ['Nospace', 'Whitespace', 'Nossembly'], error, raw }: ExampleProps) {
  const ir = React.useMemo(() => NospaceIR.fromNossembly(example), [example]);

  const [lang, setLang] = React.useState(languages[0]);

  const contents = React.useMemo(() => {
    if (raw) {
      return raw;
    }

    if (lang === 'Nossembly') {
      return example;
    }
    
    return serializeProgram(lang, ir) + '\n';
  }, [lang, ir, raw]);

  return (
    <Container>
      <LanguageSwitcher>
        {languages.map((l) => (
          <LanguageButton onClick={() => setLang(l)} selected={lang === l} key={l}>{l}</LanguageButton>
        ))}
      </LanguageSwitcher>
      <Code>{contents}</Code>
      {error && <Error>{error}</Error>}
    </Container>
  );
}
