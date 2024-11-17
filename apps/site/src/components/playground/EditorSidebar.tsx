import React from 'react';
import styled from '@emotion/styled';
import { usePlaygroundContext } from './PlaygroundContext';

const SidebarContainer = styled.div`
  min-width: 500px;
  background-color: #2e2e2e;
  border-left: solid 1px #767676;
  padding: 16px;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CodeBox = styled.code`
  padding: 8px;
  min-height: fit-content;
  background-color: #1e1e1e;
  flex: 0;
`;

const getMessageColor = (type: 'error' | 'success' | 'warning') => {
  switch (type) {
    case 'success':
      return '#8ce08c';
    case 'error':
      return '#e08c8c';
    case 'warning':
      return '#ffbf33';
  }
};

const Message = styled.div<{ type: 'error' | 'success' | 'warning' }>`
  color: ${({ type }) => getMessageColor(type)};
`;

const TextArea = styled.textarea`
  background-color: #1e1e1e;
  flex: 1;
  color: white;
  padding: 8px;
`;

const Field = styled.div<{ stretch?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: ${({ stretch }) => (stretch ? 1 : 0)};
`;

export const EditorSidebar = () => {
  const { compilerOutput, programInput, setProgramInput, programOutput } =
    usePlaygroundContext();

  return (
    <SidebarContainer>
      <Field>
        Compiler output
        <CodeBox>
          {compilerOutput.map((x, i) => (
            <Message type={x.type} key={i}>
              {x.message}
            </Message>
          ))}
        </CodeBox>
      </Field>
      <Field stretch>
        Program input
        <TextArea
          value={programInput}
          onChange={(e) => setProgramInput(e.target.value)}
        ></TextArea>
      </Field>
      <Field stretch>
        Program output
        <TextArea value={programOutput} readOnly></TextArea>
      </Field>
    </SidebarContainer>
  );
};
